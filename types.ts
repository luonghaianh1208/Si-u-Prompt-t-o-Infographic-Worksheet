
export interface FeatureOption {
  id: string;
  label: string;
}

export enum TargetAudience {
  PRESCHOOL = "Mầm non",
  PRIMARY = "Tiểu học",
  SECONDARY = "THCS",
  HIGH_SCHOOL = "THPT",
  UNIVERSITY = "Đại học",
  OTHER = "Khác (Nhập đối tượng...)"
}

export enum MaterialType {
  INFOGRAPHIC = "Infographic",
  WORKSHEET = "Phiếu học tập (Worksheet)",
  POSTER = "Poster (Ápphích giáo dục)",
  COMIC = "Truyện tranh (Comic/Manga)",
  FLASHCARD = "Thẻ học (Flashcards)",
  MINDMAP = "Sơ đồ tư duy (Mindmap)"
}

export enum VisualStyle {
  // New & Highlighted Styles
  CUTE_PASTEL = "✨ Cute Pastel (Màu phấn dịu nhẹ, đáng yêu, thân thiện)",
  CLASSICAL_VIETNAM = "✨ Classical Vietnam (Đậm đà văn hóa Việt, mộc mạc, gần gũi)",
  ACADEMIC = "✨ Academic Education (Cấu trúc rõ ràng, chuyên nghiệp, tập trung kiến thức)",
  DOODLE = "✨ Hand-Drawn Doodle (Nét vẽ tự nhiên, sáng tạo, vui nhộn)",
  FLAT_DESIGN = "✨ Flat Design (Tối giản, hiện đại, trực quan, dễ tiếp nhận)",
  ANIME = "✨ Anime (Trẻ trung, năng động, thu hút sự chú ý)",
  GRAPHIC_3D = "✨ 3D Graphics (Hình khối, chiều sâu thực tế, ấn tượng)",
  VINTAGE = "✨ Vintage (Hoài niệm, mang dấu ấn lịch sử, trang trọng)",
  GRADIENT = "✨ Gradient Modern (Chuyển màu mượt mà, thời thượng, bắt mắt)",
  INTERACTIVE = "✨ Interactive (Khuyến khích tương tác, tăng trải nghiệm học tập)",
  
  // Existing Styles kept for compatibility
  REALISTIC = "Realistic (Chân thực, ảnh chụp)",
  SKETCH = "Hand-drawn Sketch (Phác thảo chì/Vẽ tay)",
  WATERCOLOR = "Watercolor (Màu nước nghệ thuật)",
  PIXEL_ART = "Pixel Art (Phong cách game 8-bit)",
  INFOGRAPHIC = "Infographic Vector (Đồ họa thông tin chuyên nghiệp)",
  MINIMALIST = "Minimalist (Tối giản, tinh tế)",
  ISOMETRIC = "Isometric 3D (Góc nhìn 3D kỹ thuật)",
  LINE_ART = "Line Art (Nét vẽ đơn giản, phù hợp tô màu)",
  PAPER_CUT = "Paper Cutout (Cắt giấy nghệ thuật)",
  CLAYMATION = "Claymation (Đất sét nặn)",
  OTHER = "Khác (Nhập mô tả của bạn...)"
}

export interface FormData {
  topic: string;
  educationField: string;
  subject: string;
  materialType: string;
  targetAudience: string;
  customTargetAudience: string;
  contentLanguage: string;
  keyContent: string;
  autoContent: boolean;
  features: string[];
  visualStyle: string;
  customStyle: string;
  dimension: string;
  imageQuality: string;
}

export interface FormErrors {
  topic?: string;
  educationField?: string;
  subject?: string;
  materialType?: string;
  targetAudience?: string;
  customTargetAudience?: string;
  keyContent?: string;
  customStyle?: string;
  fullName?: string;
  mainSubject?: string;
  dimension?: string;
  contentLanguage?: string;
  imageQuality?: string;
}

export interface UserProfile {
  fullName: string;
  avatarUrl: string | null;
  gradeLevel: string;
  mainSubject: string;
  subSubject: string;
  teachingStyle: string;
  bio: string;
}

export interface SavedPrompt {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  data: FormData;
}

// --- NEW TYPES ---
export type MainTab = 'create_prompt' | 'create_image' | 'learn_ideas' | 'profile';

export interface GeneratedImage {
  id: string;
  url: string; // Base64 Data URL
  prompt: string;
}
