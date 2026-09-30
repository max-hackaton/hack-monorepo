export type MaxPlatform = 'ios' | 'android' | 'desktop' | 'web'
export type MaxChatType = 'DIALOG' | 'CHAT' | 'CHANNEL'

export type MaxInitDataUser = {
  id: number
  first_name: string
  last_name: string
  username: string
  language_code: string
  photo_url: string
}

export type MaxInitDataChat = {
  id: number
  type: MaxChatType
}

export type MaxInitData = {
  query_id: string
  ip?: string
  auth_date: number
  hash: string
  user: MaxInitDataUser
  chat: MaxInitDataChat
  start_param: string
}

export type MaxLaunchContext = {
  entryPoint: 'tabbar' | 'default'
}

export type MaxBrightnessState = {
  maxBrightness: boolean
}

export type MaxScreenCaptureState = {
  isScreenCaptureEnabled: boolean
}

export type MaxViewportSize = {
  height: string
  width: string
}

export type MaxContactData = {
  phone: string
  authDate: string
  hash: string
}

export type MaxDownloadResult = {
  status: 'downloading' | 'cancelled'
}

export type MaxShareContent =
  { text: string; link?: string } | { text?: string; link: string }

export type MaxShareMediaContent = {
  mid: string
  chatType: 'DIALOG' | 'CHAT'
}

export type MaxShareResult = {
  status: 'shared' | 'cancelled'
}

export type MaxCodeReaderResult = {
  value: string
}

export type MaxBackButton = {
  isVisible: boolean
  show: () => void
  hide: () => void
  onClick: (callback: () => void) => void
  offClick: (callback: () => void) => void
}

export type MaxScreenCapture = {
  enableScreenCapture: () => Promise<MaxScreenCaptureState>
  disableScreenCapture: () => Promise<MaxScreenCaptureState>
}

export type MaxStorageMutationResult = {
  status: 'updated' | 'removed'
}

export type MaxStorageItem = {
  key: string
  value: string
}

export type MaxDeviceStorage = {
  setItem: (key: string, value: string) => Promise<MaxStorageMutationResult>
  getItem: (key: string) => Promise<MaxStorageItem>
  removeItem: (key: string) => Promise<MaxStorageMutationResult>
  clear: () => void
}

export type MaxSecureStorage = {
  setItem: (key: string, value: string) => Promise<MaxStorageMutationResult>
  getItem: (key: string) => Promise<MaxStorageItem>
  removeItem: (key: string) => Promise<MaxStorageMutationResult>
  clear: () => void
}

export type MaxBiometryType = 'finger' | 'face' | 'unknown'

export type MaxBiometryInfo = {
  available: boolean
  type: MaxBiometryType[]
  accessRequested: boolean
  accessGranted: boolean
  tokenSaved: boolean
  deviceId: string | null
}

export type MaxBiometricManager = {
  isInited: boolean
  isBiometricAvailable: boolean
  isAccessRequested: boolean
  isAccessGranted: boolean
  isBiometricTokenSaved: boolean
  biometricType: MaxBiometryType[]
  deviceId: string | null
  init: () => Promise<MaxBiometryInfo>
  requestAccess: (reason?: string) => Promise<MaxBiometryInfo>
  authenticate: (
    reason?: string,
  ) => Promise<{ status: 'authorized'; token: string }>
  updateBiometricToken: (
    token?: string,
    reason?: string,
  ) => Promise<MaxStorageMutationResult>
  openSettings: () => Promise<{ status: 'opened' }>
}

export type MaxHapticImpactStyle =
  'soft' | 'light' | 'medium' | 'heavy' | 'rigid'

export type MaxHapticNotificationType = 'error' | 'success' | 'warning'

export type MaxHapticFeedback = {
  impactOccurred: (
    impactStyle: MaxHapticImpactStyle,
    disableVibrationFallback?: boolean,
  ) => Promise<{ status: 'impactOccured' }>
  notificationOccurred: (
    notificationType: MaxHapticNotificationType,
    disableVibrationFallback?: boolean,
  ) => Promise<{ status: 'notificationOccured' }>
  selectionChanged: (
    disableVibrationFallback?: boolean,
  ) => Promise<{ status: 'selectionChanged' }>
}

export type MaxNfcInfo = {
  available: boolean
  enabled: boolean
  accessRevoked?: boolean
}

export type MaxNfcManager = {
  isInited: boolean
  init: () => Promise<MaxNfcInfo>
  openSystemSettings: () => Promise<{ status: 'opened' }>
  emulateNfcTag: (nfcTag?: string) => Promise<{ status: 'scanned' | 'stopped' }>
}

export type MaxBridgeError = {
  error: {
    code: string
  }
}

export type MaxWebApp = {
  initData?: string
  initDataUnsafe: MaxInitData
  platform: MaxPlatform
  version: string
  deviceName: string
  getLaunchContext: () => Promise<MaxLaunchContext>
  requestScreenMaxBrightness: () => Promise<MaxBrightnessState>
  restoreScreenBrightness: () => Promise<MaxBrightnessState>
  ScreenCapture: MaxScreenCapture
  getViewportSize: () => Promise<MaxViewportSize>
  requestContact: () => Promise<MaxContactData>
  enableClosingConfirmation: () => void
  disableClosingConfirmation: () => void
  openLink: (url: string) => void
  openMaxLink: (url: string) => void
  downloadFile: (url: string, fileName: string) => Promise<MaxDownloadResult>
  shareContent: (params: MaxShareContent) => Promise<MaxShareResult>
  shareMaxContent: (
    params: MaxShareContent | MaxShareMediaContent,
  ) => Promise<MaxShareResult>
  openCodeReader: (fileSelect?: boolean) => Promise<MaxCodeReaderResult>
  BackButton: MaxBackButton
  DeviceStorage: MaxDeviceStorage
  SecureStorage: MaxSecureStorage
  BiometricManager: MaxBiometricManager
  HapticFeedback: MaxHapticFeedback
  NfcManager: MaxNfcManager
}
