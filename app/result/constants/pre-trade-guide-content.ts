import type { LucideIcon } from 'lucide-react';
import {
  CalendarClock,
  Handshake,
  Image,
  Images,
  MapPin,
  Package,
  User,
  UserStar,
  Video,
} from 'lucide-react';
import type { MultilineCopy } from '@/src/lib/multiline-copy';
import type { RiskLevel } from '@/src/lib/risk-styles';

export interface PreTradeGuideAction {
  title: string;
  description?: string;
  icon: LucideIcon;
}

export interface PreTradeGuideContent {
  actions: readonly PreTradeGuideAction[];
  reassuranceBubble?: MultilineCopy;
  sellerMessage?: MultilineCopy;
  showCopyButton: boolean;
}

const HIGH_WITH_SUSPICION_SELLER_MESSAGE: MultilineCopy = [
  '안녕하세요.',
  '',
  '거래 전 확인을 위해 원본 사진과 다른 각도 사진을 부탁드립니다.',
  '',
  '현재 사진에서 확인이 어려운 부분이 있어 오늘 날짜가 보이도록 촬영한 사진이나 짧은 영상도 함께 보내주실 수 있을까요?',
  '',
  '감사합니다.',
];

const HIGH_WITHOUT_SUSPICION_SELLER_MESSAGE: MultilineCopy = [
  '안녕하세요.',
  '',
  '거래 전 확인을 위해 원본 사진과 추가 사진을 부탁드립니다.',
  '',
  '현재 사진만으로는 상태를 충분히 확인하기 어려워 여러 각도에서 촬영한 사진을 함께 보내주시면 감사하겠습니다.',
];

const MEDIUM_WITH_SUSPICION_SELLER_MESSAGE: MultilineCopy = [
  '안녕하세요.',
  '',
  '거래 전 확인을 위해 현재 분석에서 확인된 부분을 조금 더 자세히 보고 싶습니다.',
  '',
  '제품의 다른 각도 사진과 해당 부위 확대 사진을 보내주실 수 있을까요?',
  '',
  '감사합니다.',
];

const MEDIUM_WITHOUT_SUSPICION_SELLER_MESSAGE: MultilineCopy = [
  '안녕하세요.',
  '',
  '거래 전 확인을 위해 제품의 추가 사진을 부탁드립니다.',
  '',
  '현재 등록된 사진만으로는 상태를 판단하기 어려워 다른 각도 사진이나 짧은 영상을 함께 보내주시면 감사하겠습니다.',
];

const LOW_WITH_SUSPICION_SELLER_MESSAGE: MultilineCopy = [
  '안녕하세요.',
  '',
  '거래 전 참고를 위해 제품의 해당 부분을 조금 더 자세히 확인하고 싶습니다.',
  '',
  '가능하시다면 해당 영역 확대 사진을 보내주실 수 있을까요?',
  '',
  '감사합니다.',
];

const LOW_WITHOUT_SUSPICION_REASSURANCE: MultilineCopy = [
  '사진에서 특별한 의심 신호가 발견되지 않았습니다.',
  '안전한 거래를 응원합니다!',
];

const PRE_TRADE_GUIDE_CONTENT: Record<RiskLevel, Record<'true' | 'false', PreTradeGuideContent>> = {
  high: {
    true: {
      actions: [
        {
          title: '원본 사진 요청',
          description: '보정되거나 압축되지 않은 원본 사진을 확인해보세요.',
          icon: Image,
        },
        {
          title: '다른 각도 사진 요청',
          description: '현재 사진에서 보이지 않는 부분을 추가로 확인해보세요.',
          icon: Images,
        },
        {
          title: '실시간 촬영 요청',
          description: '오늘 날짜가 보이도록 촬영한 사진을 요청해보세요.',
          icon: CalendarClock,
        },
        {
          title: '직거래 권장',
          description: '가능하다면 직접 상태를 확인한 뒤 거래하세요.',
          icon: Handshake,
        },
      ],
      sellerMessage: HIGH_WITH_SUSPICION_SELLER_MESSAGE,
      showCopyButton: true,
    },
    false: {
      actions: [
        {
          title: '원본 사진 요청',
          description: '보정·압축 없이 촬영된 원본 사진을 요청해보세요.',
          icon: Image,
        },
        {
          title: '추가 사진 요청',
          description: '다른 각도나 디테일이 보이는 사진을 더 받아보세요.',
          icon: Images,
        },
        {
          title: '영상 요청',
          description: '짧은 영상으로 실제 상태를 확인해보세요.',
          icon: Video,
        },
        {
          title: '직거래 권장',
          description: '가능하다면 직접 상태를 확인한 뒤 거래하세요.',
          icon: MapPin,
        },
      ],
      sellerMessage: HIGH_WITHOUT_SUSPICION_SELLER_MESSAGE,
      showCopyButton: true,
    },
  },
  medium: {
    true: {
      actions: [
        {
          title: '원본 사진 요청',
          description: '보정·압축 없이 촬영된 원본 사진을 확인해보세요.',
          icon: Image,
        },
        {
          title: '다른 각도 사진 요청',
          description: '현재 사진에서 보이지 않는 부분을 추가로 확인해보세요.',
          icon: Images,
        },
        {
          title: '실시간 촬영 요청',
          description: '오늘 날짜가 보이도록 촬영한 사진을 요청해보세요.',
          icon: CalendarClock,
        },
        {
          title: '직거래 권장',
          description: '가능하다면 직접 상태를 확인한 뒤 거래하세요.',
          icon: Handshake,
        },
      ],
      sellerMessage: MEDIUM_WITH_SUSPICION_SELLER_MESSAGE,
      showCopyButton: true,
    },
    false: {
      actions: [
        {
          title: '추가 사진 요청',
          description: '다른 각도나 디테일이 보이는 사진을 더 받아보세요.',
          icon: Images,
        },
        {
          title: '영상 요청',
          description: '짧은 영상으로 실제 상태를 확인해보세요.',
          icon: Video,
        },
        {
          title: '원본 사진 요청',
          description: '보정·압축 없이 촬영된 원본 사진을 요청해보세요.',
          icon: Image,
        },
        {
          title: '직거래 권장',
          description: '가능하다면 직접 상태를 확인한 뒤 거래하세요.',
          icon: MapPin,
        },
      ],
      sellerMessage: MEDIUM_WITHOUT_SUSPICION_SELLER_MESSAGE,
      showCopyButton: true,
    },
  },
  low: {
    true: {
      actions: [
        {
          title: '추가 사진 확인',
          description: '구성품이나 세부 상태가 보이는 사진을 한 번 더 확인해보세요.',
          icon: Images,
        },
        {
          title: '구성품 확인',
          description: '박스, 영수증, 구성품 목록이 일치하는지 살펴보세요.',
          icon: Package,
        },
        {
          title: '직거래 권장',
          description: '가능하다면 직접 상태를 확인한 뒤 거래하세요.',
          icon: Handshake,
        },
      ],
      sellerMessage: LOW_WITH_SUSPICION_SELLER_MESSAGE,
      showCopyButton: true,
    },
    false: {
      actions: [
        {
          title: '기본 정보 확인',
          description: '모델명, 구성품, 상태 등 기본 정보를 확인해보세요.',
          icon: User,
        },
        {
          title: '판매자 신뢰도 확인',
          description: '거래 이력, 평판, 후기 등을 확인해보세요.',
          icon: UserStar,
        },
        {
          title: '직거래 또는 안전거래',
          description: '직거래 또는 안전결제 서비스를 이용하면 더 안심할 수 있어요.',
          icon: Handshake,
        },
      ],
      reassuranceBubble: LOW_WITHOUT_SUSPICION_REASSURANCE,
      showCopyButton: false,
    },
  },
};

export function getPreTradeGuideContent(level: RiskLevel, suspicionDetected: boolean): PreTradeGuideContent {
  return PRE_TRADE_GUIDE_CONTENT[level][suspicionDetected ? 'true' : 'false'];
}

export interface PreTradeGuideTheme {
  reassuranceBox: string;
  reassuranceBorder: string;
  actionIcon: string;
  actionIconWrap: string;
}

const PRE_TRADE_GUIDE_THEME: Record<RiskLevel, PreTradeGuideTheme> = {
  high: {
    reassuranceBox: 'bg-[#FFF1F4]',
    reassuranceBorder: 'border-[#FFD6DC]',
    actionIcon: 'text-[#FF4756]',
    actionIconWrap: 'bg-[#FFF6F8]',
  },
  medium: {
    reassuranceBox: 'bg-[#FFF8E7]',
    reassuranceBorder: 'border-[#FFE8A8]',
    actionIcon: 'text-[#FFBC1F]',
    actionIconWrap: 'bg-[#FFFBF0]',
  },
  low: {
    reassuranceBox: 'bg-[#EEFBF1]',
    reassuranceBorder: 'border-[#B8E8C4]',
    actionIcon: 'text-[#30C462]',
    actionIconWrap: 'bg-[#F3FCF6]',
  },
};

export function getPreTradeGuideTheme(level: RiskLevel): PreTradeGuideTheme {
  return PRE_TRADE_GUIDE_THEME[level];
}
