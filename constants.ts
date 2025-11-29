

import { FeatureOption, TargetAudience, VisualStyle, MaterialType, UserProfile } from './types';

export const TARGET_AUDIENCES = Object.values(TargetAudience);

export const MATERIAL_TYPES = Object.values(MaterialType);

export const VISUAL_STYLES = Object.values(VisualStyle);

export const FEATURE_OPTIONS: FeatureOption[] = [
  { id: 'fill_blank', label: 'Để ô trống cho học sinh điền (Fill in the blank)' },
  { id: 'mascot', label: 'Có hình minh họa nhân vật (Character Mascot)' },
  { id: 'charts', label: 'Kèm theo số liệu/biểu đồ (Charts/Data)' },
  { id: 'summary', label: 'Có bảng tổng kết cuối trang (Summary box)' },
  { id: 'relevant_visuals', label: 'Sử dụng các hình ảnh minh hoạ, biểu tượng phù hợp (Relevant Illustrations/Icons)' },
];

export const OTHER_STYLE_KEY = VisualStyle.OTHER;
export const OTHER_AUDIENCE_KEY = TargetAudience.OTHER;

// --- NEW CONSTANTS ---

export const EDUCATION_FIELDS = [
  "Giáo dục Phổ thông (K-12)",
  "Giáo dục Mầm non (Preschool)",
  "Giáo dục Đại học & Cao đẳng (Higher Education)",
  "Giáo dục Nghề nghiệp (Vocational Training)",
  "Đào tạo Doanh nghiệp (Corporate Training)",
  "Giáo dục Đặc biệt (Special Education)",
  "Lĩnh vực khác (Other)"
];

export const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  avatarUrl: null,
  gradeLevel: TargetAudience.PRIMARY,
  mainSubject: '',
  subSubject: '',
  teachingStyle: 'Vui vẻ, sáng tạo, lấy học sinh làm trung tâm',
  bio: ''
};

export const COMMON_SUBJECTS = [
  "Toán học", "Ngữ Văn", "Tiếng Việt", "Tiếng Anh", "Vật Lý", "Hóa Học", 
  "Sinh Học", "Lịch Sử", "Địa Lý", "Giáo dục công dân", "Tin học", 
  "Công nghệ", "Mỹ thuật", "Âm nhạc", "Khoa học tự nhiên", 
  "Hoạt động trải nghiệm", "Giáo dục thể chất", "Giáo dục quốc phòng"
];

export const DIMENSIONS = [
  "A4 Dọc (21 x 29.7 cm) - Chuẩn in ấn phiếu học tập",
  "A4 Ngang (29.7 x 21 cm) - Bảng biểu, Sơ đồ tư duy",
  "A3 Dọc (29.7 x 42 cm) - Poster, Ápphích lớn",
  "16:9 Ngang (1920x1080px) - Trình chiếu PowerPoint/Màn hình",
  "9:16 Dọc (1080x1920px) - Điện thoại/Story/Tiktok",
  "1:1 Vuông (1080x1080px) - Mạng xã hội (Facebook/Insta)",
  "Infographic Dọc (800x2000px) - Dạng cuộn Web/Mobile",
  "A5 (14.8 x 21 cm) - Sổ tay/Tờ rơi nhỏ"
];

export const IMAGE_QUALITIES = [
  "Full HD (1920 x 1080 px) - Tiêu chuẩn (Standard)",
  "2K QHD (2560 x 1440 px) - Sắc nét (High Detail)",
  "4K UHD (3840 x 2160 px) - Chất lượng in ấn (Print Ready)",
  "8K (7680 x 4320 px) - Siêu thực (Ultra Detail)"
];

export const CONTENT_LANGUAGES = [
  "Tiếng Việt (Vietnamese)",
  "Tiếng Anh (English)",
  "Song ngữ Anh - Việt (Bilingual English-Vietnamese)",
  "Tiếng Pháp (French)",
  "Tiếng Nhật (Japanese)",
  "Tiếng Hàn (Korean)",
  "Tiếng Trung (Chinese)",
  "Không có chữ (No Text)"
];