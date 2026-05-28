export const UPLOAD_ERROR_MESSAGES = {
  TOO_MANY_FILES: '이미지는 1장만 업로드할 수 있어요.',
  UNSUPPORTED_FILE_TYPE: 'JPG, PNG, WEBP 형식만 지원해요.',
  FILE_TOO_LARGE: '이미지 용량이 너무 커요. 10MB 이하 이미지를 선택해주세요.',
  NETWORK_UNSTABLE: '네트워크가 불안정해요. 다시 시도해주세요.',
  ANALYSIS_FAILED: '업로드에 실패했어요. 다시 시도해주세요.',
} as const;

export type UploadErrorCode = keyof typeof UPLOAD_ERROR_MESSAGES;

export const getUploadErrorMessage = (code: UploadErrorCode) => UPLOAD_ERROR_MESSAGES[code];
