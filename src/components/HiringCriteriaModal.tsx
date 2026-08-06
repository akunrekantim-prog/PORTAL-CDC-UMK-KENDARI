import React from 'react';
import { X, CheckCircle2, ShieldCheck, Award, GraduationCap, BookOpen, FileCheck } from 'lucide-react';
import { Lowongan } from '../types';

interface HiringCriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Lowongan;
}

export const STUDY_FIELDS_CATEGORIES = [
  {
    category: 'Business & Management',
    fields: [
      'Accounting', 'Commerce', 'Finance', 'Actuarial Studies', 'Business', 
      'Business Administration', 'International Business', 'Management', 
      'Office Studies', 'Project Management', 'Event Management', 'Economics', 
      'Human Resources', 'Hospitality Management', 'Retail & Merchandising', 
      'Tourism', 'Marketing & Advertising', 'Public Relations', 
      'Transport, Logistics & Procurement', 'Business Information Systems'
    ]
  },
  {
    category: 'Food, Hospitality & Personal Services',
    fields: [
      'Food and Beverage Service', 'Butchery', 'Baking and Pastry-making', 
      'Cookery', 'Food Hygiene', 'Food & Hospitality (all other)', 
      'Beauty Therapy', 'Hairdressing', 'Personal Services (all other)'
    ]
  },
  {
    category: 'IT & Computer Science',
    fields: [
      'Artificial Intelligence', 'Bioinformatics', 'Computer Graphics & Animation', 
      'Computer Science', 'Computer Systems and Networks', 'Cyber Security', 
      'Data Science', 'Software Engineering', 'Video Game Development'
    ]
  },
  {
    category: 'Design & User Experience',
    fields: ['Graphic Design', 'UI/UX Design', 'Interaction Design', 'Product Design']
  },
  {
    category: 'Medical & Health Sciences',
    fields: [
      'Audiology', 'Speech Pathology', 'Biomedical Science', 'Chiropractic & Osteopathy', 
      'Dentistry & Dental Science', 'Exercise & Sports Science', 'Health Administration', 
      'Addiction Medicine', 'Anaesthesia', 'Dermatology', 'Emergency Medicine', 
      'General Practice', 'Intensive Care Medicine', 'Medical Administration', 
      'Obstetrics & Gynaecology', 'Occupational & Environmental Medicine', 'Ophthalmology', 
      'Paediatrics & Child Health', 'Pain Medicine', 'Palliative Medicine', 'Pathology', 
      'Physician', 'Psychiatry', 'Public Health Medicine', 'Radiation Oncology', 'Radiology', 
      'Rehabilitation Medicine', 'Sexual Health Medicine', 'Sport & Exercise Medicine', 'Surgery', 
      'Naturopathy, Acupuncture & Complementary Medicine', 'Aged Care Nursing', 'Community Nursing', 
      'Critical Care Nursing', 'Family & Child Health Nursing', 'Mental Health Nursing', 'Midwifery', 
      'Nursing (all other)', 'Nutrition & Dietetics', 'Occupational Therapy', 'Optometry, Ophthalmology & Orthoptics', 
      'Paramedic Science', 'Pharmacy & Pharmacology', 'Massage Therapy', 'Physiotherapy', 
      'Rehabilitation Therapies', 'Podiatry', 'Environmental Health', 'Epidemiology', 'Health Promotion', 
      'Human Movement', 'Indigenous Health', 'Occupational Health & Safety', 'Public Health (all other)', 
      'Radiography', 'Medical & Health Sciences (all other)', 'Medical Technology', 'Counselling', 'Psychology'
    ]
  },
  {
    category: 'Sciences',
    fields: [
      'Agribusiness', 'Agricultural Science', 'Aquaculture & Fisheries', 'Viticulture', 
      'Biochemistry', 'Biology', 'Chemistry', 'Earth Sciences', 'Ecology & Evolution', 
      'Environmental Studies', 'Forestry Studies', 'Parks & Wildlife Management', 'Food Science', 
      'Forensic Science', 'Genetics', 'Geology', 'Laboratory Technology', 'Marine Science', 
      'Physics', 'Veterinary Science', 'Sciences (all other)', 'Spatial Science', 'Geophysics', 'Astronomy'
    ]
  },
  {
    category: 'Trades & Services',
    fields: [
      'Building', 'Carpentry', 'Heating, Ventilation & Cooling', 'Flooring, Plastering & Tiling', 
      'Plumbing & Gasfitting', 'Bricklaying & Stonemasonry', 'Electrical', 'Glass & Glazing', 
      'Landscaping & Horticulture', 'Automotive'
    ]
  },
  {
    category: 'Engineering & Mathematics',
    fields: [
      'Aerospace Engineering', 'Air Traffic Control', 'Aircraft Maintenance Engineering', 
      'Aircraft Operation & Aviation', 'Automotive & Transport Engineering', 'Chemical Engineering', 
      'Civil Engineering & Construction', 'Communications Engineering', 'Electrical & Electronic Engineering', 
      'Engineering Management', 'Environmental Engineering', 'Fire & Safety Engineering', 'Geomatic Engineering', 
      'Manufacturing Engineering', 'Marine Engineering', 'Materials Engineering', 'Mathematics & Statistics', 
      'Mechanical Engineering', 'Mining Engineering', 'Petroleum Engineering', 'Renewable Energy Engineering', 
      'Robotics & Mechatronics Engineering', 'Engineering & Mathematics (all other)', 'Geotechnical Engineering', 
      'Biomedical Engineering'
    ]
  },
  {
    category: 'Humanities, Arts & Social Sciences',
    fields: [
      'Anthropology', 'Geography', 'Classics', 'Criminology', 'Gender Studies', 'Indigenous Studies', 
      'International Development', 'Peace & Conflict', 'Refugees & Forced Migration', 'Archaeology', 
      'History', 'International Studies', 'Modern Languages', 'Literature', 'Linguistics', 
      'Translating & Interpreting', 'Librarianship & Curatorial Studies', 'Philosophy', 'Policy Studies', 
      'Political Science', 'Public Administration', 'Social Work & Sociology', 'Theology & Comparative Religion', 
      'Humanities (all other)', 'Social Science (all other)', 'Liberal Arts'
    ]
  },
  {
    category: 'Law, Legal Studies & Justice',
    fields: [
      'Justice & Law Enforcement', 'Commercial Law', 'Constitutional Law', 'Criminal Law', 
      'Family Law', 'International Law', 'Tax Law', 'Legal Studies'
    ]
  },
  {
    category: 'Property & Built Environment',
    fields: [
      'Architecture', 'Interior Design', 'Landscape Architecture', 'Construction Management', 
      'Property, Land & Real Estate', 'Quantity Surveying', 'Sustainable Development', 'Urban Design & Town Planning'
    ]
  },
  {
    category: 'Teaching & Education',
    fields: [
      'Curriculum Studies', 'Early Childhood Education', 'General Education Studies', 
      'Primary Teaching', 'Secondary Teaching', 'Special Education', 'Tertiary Education', 
      'TESOL', 'Vocational Education & Training'
    ]
  }
];

export const HiringCriteriaModal: React.FC<HiringCriteriaModalProps> = ({
  isOpen,
  onClose,
  job
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white max-w-2xl w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-fadeIn my-6 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-xl font-extrabold text-slate-900">Hiring Criteria</h2>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition"
          >
            <span>Close dialog</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 divide-y divide-slate-100">
          
          {/* Section 1: Work Rights */}
          <div className="space-y-3 pt-2 first:pt-0">
            <h3 className="text-lg font-bold text-slate-900">Hak Kerja (Work rights)</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Peluang karir ini terbuka untuk pelamar yang memenuhi kategori berikut:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                IndonesiaWork right - Indonesia
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Indonesia
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Warga Negara Indonesia (WNI)
              </span>
            </div>
          </div>

          {/* Section 2: Qualifications & other requirements */}
          <div className="space-y-6 pt-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Kualifikasi &amp; Persyaratan Utama</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Anda harus sudah lulus atau sedang menyelesaikan pendidikan di bidang berikut untuk melamar posisi ini.
              </p>
            </div>

            {/* Sub-block: Degree or Certificate */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
              <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Tingkat Pendidikan / Ijazah</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Level Kualifikasi</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">Sarjana (S1 / D4) atau Lebih Tinggi</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">IPK Minimum</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">GPA (4 point) 3.00</div>
                </div>
              </div>
            </div>

            {/* Sub-block: Study Field */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h4 className="text-base font-extrabold text-slate-900">Bidang Studi Terkait</h4>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">Semua Bidang Studi (Study field any)</div>
              </div>

              {/* Categorized list of study fields */}
              <div className="space-y-5">
                {STUDY_FIELDS_CATEGORIES.map((catGroup) => (
                  <div key={catGroup.category} className="space-y-2">
                    <h5 className="text-sm font-bold text-[#DD4B25]">{catGroup.category}</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {catGroup.fields.map((field) => (
                        <span 
                          key={field} 
                          className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:border-slate-300 transition"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition"
          >
            Selesai
          </button>
        </div>

      </div>
    </div>
  );
};
