import React, { useRef } from 'react';
import { UserProfile, FormErrors } from '../types';
import { TARGET_AUDIENCES, COMMON_SUBJECTS } from '../constants';
import { Input } from './Input';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { User, Upload, Save } from 'lucide-react';

interface ProfileSettingsProps {
  profile: UserProfile;
  onChange: (profile: UserProfile) => void;
  onSave: () => void;
  errors: FormErrors;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  profile,
  onChange,
  onSave,
  errors
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof UserProfile, value: string) => {
    onChange({ ...profile, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert("Kích thước ảnh quá lớn (Tối đa 1MB)");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({ ...profile, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold flex items-center">
            <User className="mr-2" /> Hồ sơ Giáo viên
          </h2>
          <p className="mt-2 text-indigo-100 opacity-90">
            Cập nhật thông tin để AI tối ưu hóa prompt dựa trên phong cách và chuyên môn của bạn.
          </p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Avatar Section */}
          <div className="flex items-center space-x-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg flex items-center justify-center text-slate-300">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} />
                )}
              </div>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
              >
                <Upload className="text-white" size={24} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900">Ảnh đại diện</h3>
              <p className="text-sm text-slate-500">Nhấp vào ảnh để thay đổi. JPG, PNG tối đa 1MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1">
            <Input 
              label="Họ và tên"
              value={profile.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Nhập tên hiển thị của bạn"
              error={errors.fullName}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Select
                label="Cấp học giảng dạy chính"
                options={TARGET_AUDIENCES}
                value={profile.gradeLevel}
                onChange={(e) => handleChange('gradeLevel', e.target.value)}
              />
              <Select
                label="Môn học chính"
                options={COMMON_SUBJECTS}
                value={profile.mainSubject}
                onChange={(e) => handleChange('mainSubject', e.target.value)}
                placeholder="Chọn môn học chính..."
                error={errors.mainSubject}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Môn học phụ / Kiêm nhiệm (Nếu có)"
                value={profile.subSubject}
                onChange={(e) => handleChange('subSubject', e.target.value)}
                placeholder="Ví dụ: Hoạt động trải nghiệm"
                fullWidth
              />
              <Input 
                label="Phong cách giảng dạy"
                value={profile.teachingStyle}
                onChange={(e) => handleChange('teachingStyle', e.target.value)}
                placeholder="Ví dụ: Hài hước, Nghiêm khắc, Hiện đại..."
                fullWidth
              />
            </div>

            <TextArea 
              label="Giới thiệu bản thân (Bio)"
              value={profile.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Mô tả thêm về kinh nghiệm hoặc sở thích thiết kế của bạn để AI hiểu rõ hơn..."
              rows={3}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={onSave}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
              <Save size={20} className="mr-2" />
              Lưu Hồ Sơ
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
