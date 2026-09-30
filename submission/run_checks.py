"""Validate or execute DATA-API.yaml. No request bodies or credentials are logged."""
import argparse
from contextlib import ExitStack
from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
import re
import sys
import time
from urllib.parse import quote, urlsplit
import uuid

from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import validate as validate_openapi
from referencing import Registry
from referencing.jsonschema import DRAFT202012
import requests
import yaml

ROOT = Path(__file__).resolve().parent
TOKEN = re.compile(r"\$\{([a-zA-Z0-9_.]+)\}")
HTTP_METHODS = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}


def make_session(token=None):
    session = requests.Session()
    if token is not None:
        # Each client only requests the validated base URL, with redirects disabled.
        session.cookies.set("max_session", token, path="/")
    return session


def pointer(document, path):
    value = document
    if not path:
        return value
    if not path.startswith("/"):
        raise ValueError("Expected a JSON Pointer")
    for segment in path[1:].split("/"):
        key = segment.replace("~1", "/").replace("~0", "~")
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def expand(value, context, depth=0):
    if depth > 10:
        raise ValueError("Cyclic template reference")
    if isinstance(value, dict):
        return {key: expand(item, context, depth + 1) for key, item in value.items()}
    if isinstance(value, list):
        return [expand(item, context, depth + 1) for item in value]
    if not isinstance(value, str):
        return value

    def lookup(name):
        result = context
        for part in name.split("."):
            result = result[part]
        return result

    match = TOKEN.fullmatch(value)
    if match:
        return expand(lookup(match[1]), context, depth + 1)
    return TOKEN.sub(lambda match: str(lookup(match[1])), value)


def load_package():
    manifest = yaml.safe_load((ROOT / "DATA-API.yaml").read_text())
    schema = json.loads((ROOT / "DATA-API.schema.json").read_text())
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(manifest)
    spec_path = ROOT / manifest["openapi_file"]
    spec = yaml.safe_load(spec_path.read_text())
    validate_openapi(spec)
    identifiers = set()
    covered = set()
    for check in manifest["checks"]:
        if check["id"] in identifiers:
            raise ValueError(f"Duplicate check: {check['id']}")
        identifiers.add(check["id"])
        req = check["request"]
        operation = spec["paths"][req["path"]][req["method"].lower()]
        covered.add((req["path"], req["method"].lower()))
        if operation["operationId"] != check["operation_id"]:
            raise ValueError(f"Wrong operationId: {check['id']}")
        names = set(re.findall(r"\{([^}]+)\}", req["path"]))
        if names != set(req["path_parameters"]):
            raise ValueError(f"Missing or extra path parameters: {check['id']}")
        for code in check["expected"]["status_codes"]:
            if str(code) not in operation["responses"]:
                raise ValueError(f"Undocumented response {code}: {check['id']}")
        ref = check["expected"].get("schema", {}).get("$ref")
        if ref:
            filename, fragment = ref.split("#", 1)
            if filename != manifest["openapi_file"]:
                raise ValueError("Response schema must reference the bundled OpenAPI")
            pointer(spec, fragment)
    documented = {(path, method) for path, methods in spec["paths"].items()
                  for method in methods if method in HTTP_METHODS}
    missing = documented - covered
    if missing:
        operations = ", ".join(f"{method.upper()} {path}" for path, method in sorted(missing))
        raise ValueError(f"Missing checks for OpenAPI operations: {operations}")
    registry = Registry().with_resource(spec_path.as_uri(), DRAFT202012.create_resource(spec))
    return manifest, registry


def verify_response(response, expected, registry):
    if response.status_code not in expected["status_codes"]:
        raise ValueError(f"HTTP {response.status_code}; expected {expected['status_codes']}")
    media = response.headers.get("Content-Type", "").split(";", 1)[0].strip().lower()
    if "content_type" in expected and media != expected["content_type"]:
        raise ValueError(f"Content-Type {media}; expected {expected['content_type']}")
    if media != "application/json":
        if response.status_code == 200 and not response.content:
            raise ValueError("Empty response body")
        return None
    document = response.json()
    if "schema" in expected:
        schema = {"$id": (ROOT / "DATA-API.yaml").as_uri(), **expected["schema"]}
        Draft202012Validator(schema, registry=registry, format_checker=FormatChecker()).validate(document)
    for field in expected.get("required_fields", []):
        if field not in document:
            raise ValueError(f"Missing response field: {field}")
    for assertion in expected.get("assertions", []):
        value = pointer(document, assertion["pointer"])
        if "equals" in assertion and value != assertion["equals"]:
            raise ValueError(f"Unexpected value at {assertion['pointer']}")
        if "excludes_object" in assertion:
            forbidden = assertion["excludes_object"]
            if not isinstance(value, list) or any(all(item.get(k) == v for k, v in forbidden.items()) for item in value):
                raise ValueError(f"Forbidden item at {assertion['pointer']}")
    return document


def execute(check, context, base_url, session, registry):
    request = expand(check["request"], context)
    path = request["path"]
    for key, value in request["path_parameters"].items():
        path = path.replace("{" + key + "}", quote(str(value), safe=""))
    expected = expand(check["expected"], context)
    with ExitStack() as stack:
        kwargs = {}
        if "body" in request:
            kwargs["json"] = request["body"]
        if "multipart" in request:
            kwargs["data"] = request["multipart"]["fields"]
            kwargs["files"] = []
            for item in request["multipart"]["files"]:
                file_path = (ROOT / item["path"]).resolve()
                if ROOT not in file_path.parents:
                    raise ValueError("Fixture file must be inside the package")
                handle = stack.enter_context(file_path.open("rb"))
                kwargs["files"].append((item["field"], (file_path.name, handle, item["content_type"])))
        response = session.request(request["method"], base_url + path, params=request["query"],
                                   headers=request["headers"], timeout=(10, 60), allow_redirects=False, **kwargs)
    document = verify_response(response, expected, registry)
    extracted = {name: pointer(document, path) for name, path in check.get("extract", {}).items()}
    context.update(extracted)
    return response.status_code


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--accounts", type=Path, default=ROOT / "accounts.private.json")
    parser.add_argument("--base-url")
    parser.add_argument("--origin")
    parser.add_argument("--allow-local-http", action="store_true")
    parser.add_argument("--report", type=Path, default=ROOT / "report.json")
    args = parser.parse_args()
    manifest, registry = load_package()
    if args.validate_only:
        covered = {(check["request"]["path"], check["request"]["method"]) for check in manifest["checks"]}
        print(f"VALID: OpenAPI 3.1, team DATA-API 1.0, {len(manifest['checks'])} checks, "
              f"{len(covered)} operations (all documented operations covered)")
        return 0
    base_url = (args.base_url or manifest["base_url"]).rstrip("/")
    parsed = urlsplit(base_url)
    local = args.allow_local_http and parsed.scheme == "http" and parsed.hostname in ("localhost", "127.0.0.1")
    if not parsed.hostname or parsed.username or parsed.path or parsed.query or parsed.fragment or not (parsed.scheme == "https" or local):
        raise ValueError("Only an HTTPS origin or explicitly enabled HTTP loopback is allowed")
    credentials = json.loads(args.accounts.read_text())
    if credentials["base_url"].rstrip("/") != base_url:
        raise ValueError("Credential target differs from API target; no requests sent")
    if not re.fullmatch(r"evaluation_[0-9a-f]{16}", credentials["fixture"]["namespace"]):
        raise ValueError("Credentials must belong to an isolated evaluation fixture")
    now = datetime.now(timezone.utc)
    for role in manifest["authentication"]["roles"]:
        account = credentials["accounts"][role]
        if datetime.fromisoformat(account["expires_at"].replace("Z", "+00:00")) <= now:
            raise ValueError(f"Expired credentials for {role}")
    sessions = {"anonymous": make_session()}
    sessions.update({role: make_session(credentials["accounts"][role]["cookie"])
                     for role in manifest["authentication"]["roles"]})
    run_id = now.strftime("%Y%m%dT%H%M%SZ") + "-" + uuid.uuid4().hex[:6]
    context = {**manifest["variables"], "origin": args.origin or manifest["variables"]["origin"],
               "fixture": credentials["fixture"], "accounts": credentials["accounts"], "run_id": run_id,
               "violation_started_at": (now - timedelta(days=3)).isoformat(),
               "data": json.loads((ROOT / manifest["test_data_file"]).read_text())}
    results = []
    try:
        for check in manifest["checks"]:
            started = time.monotonic()
            result = {"id": check["id"], "role": check["role"]}
            try:
                result["http_status"] = execute(check, context, base_url, sessions[check["role"]], registry)
                result["result"] = "PASS"
            except Exception as error:
                # Schema exceptions can include instance values; keep reports free of response bodies.
                result["result"] = "FAIL"
                result["error_type"] = type(error).__name__
                if isinstance(error, ValueError) and not isinstance(error, json.JSONDecodeError):
                    result["error"] = str(error)
                if hasattr(error, "absolute_path"):
                    result["response_path"] = "/" + "/".join(map(str, error.absolute_path))
            result["duration_seconds"] = round(time.monotonic() - started, 3)
            results.append(result)
            print(f"{result['result']} {check['id']}" + (f": {result.get('error', result.get('error_type'))}" if result['result'] == 'FAIL' else ""))
            if result["result"] == "FAIL":
                break
    finally:
        for session in sessions.values():
            session.close()
    complete = len(results) == len(manifest["checks"]) and all(r["result"] == "PASS" for r in results)
    report = {"run_id": run_id, "base_url": base_url, "started_at": now.isoformat(),
              "result": "PASS" if complete else "FAIL", "executed": len(results),
              "skipped": len(manifest["checks"]) - len(results), "checks": results}
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"{report['result']}: {len(results)} executed, {report['skipped']} skipped. Report: {args.report}")
    return 0 if complete else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:
        print(f"Cannot start: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(1)
