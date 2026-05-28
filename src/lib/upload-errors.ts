export type UploadErrorMessage = {
  title: string;
  description: string;
};

export const UPLOAD_ERROR_MESSAGES = {
  TOO_MANY_FILES: {
    title: '이미지는 1장만 업로드할 수 있어요',
    description: '한 번에 이미지 1장만 선택해주세요.',
  },
  UNSUPPORTED_FILE_TYPE: {
    title: '지원하지 않는 파일 형식이에요',
    description: 'JPG, PNG, WEBP 파일만 업로드할 수 있어요.',
  },
  FILE_TOO_LARGE: {
    title: '이미지 용량이 너무 커요',
    description: '10MB 이하 이미지를 선택해주세요.',
  },
  NETWORK_UNSTABLE: {
    title: '네트워크 연결이 불안정해요',
    description: '연결 상태를 확인한 뒤 다시 시도해주세요.',
  },
  ANALYSIS_FAILED: {
    title: '분석에 실패했어요',
    description: '잠시 후 다시 시도해주세요.',
  },
} as const satisfies Record<string, UploadErrorMessage>;

export type UploadErrorCode = keyof typeof UPLOAD_ERROR_MESSAGES;

export const getUploadErrorMessage = (code: UploadErrorCode) => UPLOAD_ERROR_MESSAGES[code];
