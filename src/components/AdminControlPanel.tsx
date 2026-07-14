import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminControlPanel({ onViewStudentSite }: { onViewStudentSite: () => void }) {
  const [activeTab, setActiveTab] = useState<'students' | 'courses'>('students');
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Course Form State
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '', sub: '', duration: '', description: '', video_id: '', topics: ''
  });

  const loadData = async () => {
    setLoading(true);
    const [
      { data: sData },
      { data: cData },
      { data: eData }
    ] = await Promise.all([
      supabase.from('students').select('*').order('full_name', { ascending: true }),
      supabase.from('courses').select('*').order('id', { ascending: true }),
      supabase.from('enrollments').select('*')
    ]);
    
    if (sData) setStudents(sData);
    if (cData) setCourses(cData);
    if (eData) setEnrollments(eData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleEnrollment = async (studentId: string, courseId: number) => {
    const isEnrolled = enrollments.find(e => e.student_id === studentId && e.course_id === courseId);
    if (isEnrolled) {
      await supabase.from('enrollments').delete().match({ student_id: studentId, course_id: courseId });
    } else {
      await supabase.from('enrollments').insert({ student_id: studentId, course_id: courseId });
    }
    loadData();
  };

  const removeStudent = async (studentId: string) => {
    if (window.confirm("Are you sure you want to remove this student? This removes their access and data from the students table.")) {
      await supabase.from('students').delete().match({ id: studentId });
      loadData();
    }
  };

  // --- Course Management Functions ---
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use proper array format if the user types a comma-separated string
    const topicsArray = formData.topics.split(',').map(t => t.trim()).filter(Boolean);
    
    const payload = {
      title: formData.title,
      sub: formData.sub,
      duration: formData.duration,
      description: formData.description,
      video_id: formData.video_id.trim() || null,
      topics: topicsArray
    };

    if (isEditingCourse && editingCourseId) {
      await supabase.from('courses').update(payload).match({ id: editingCourseId });
    } else {
      await supabase.from('courses').insert(payload);
    }
    
    resetForm();
    loadData();
  };

  const editCourse = (c: any) => {
    setIsEditingCourse(true);
    setEditingCourseId(c.id);
    setFormData({
      title: c.title || '',
      sub: c.sub || '',
      duration: c.duration || '',
      description: c.description || '',
      video_id: c.video_id || '',
      topics: c.topics ? (Array.isArray(c.topics) ? c.topics.join(', ') : c.topics) : ''
    });
  };

  const deleteCourse = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this course box?")) {
      await supabase.from('courses').delete().match({ id });
      loadData();
    }
  };

  const resetForm = () => {
    setIsEditingCourse(false);
    setEditingCourseId(null);
    setFormData({ title: '', sub: '', duration: '', description: '', video_id: '', topics: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b0b0f] text-white">
        <h2 className="text-2xl font-black uppercase tracking-widest animate-pulse">
          Loading Access Matrix...
        </h2>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#0b0b0f] min-h-screen text-white font-sans overflow-auto relative z-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase tracking-tight">
            Admin Control Panel
          </h1>
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 font-bold uppercase tracking-widest text-xs rounded-lg transition-all ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Student Access
            </button>
            <button 
              onClick={() => setActiveTab('courses')}
              className={`px-4 py-2 font-bold uppercase tracking-widest text-xs rounded-lg transition-all ${activeTab === 'courses' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Manage Courses
            </button>
          </div>
        </div>
        <button 
          onClick={onViewStudentSite}
          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest text-sm shadow-lg shadow-purple-500/20 transition-all transform hover:scale-105"
        >
          View Student Site
        </button>
      </div>

      {/* Tab: STUDENTS */}
      {activeTab === 'students' && (
        <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#14141a] shadow-2xl backdrop-blur-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700 bg-black/40">
                <th className="p-4 text-xs font-black tracking-widest uppercase text-gray-400">Student Name</th>
                <th className="p-4 text-xs font-black tracking-widest uppercase text-gray-400">WhatsApp</th>
                <th className="p-4 text-xs font-black tracking-widest uppercase text-gray-400">Email</th>
                <th className="p-4 text-xs font-black tracking-widest uppercase text-gray-400 text-center">Manage</th>
                {courses.map(course => (
                  <th key={course.id} className="p-4 text-xs font-black tracking-widest uppercase text-center text-gray-400 min-w-[120px]">
                    {course.title || `Module ${course.id}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors duration-200">
                  <td className="p-4 font-bold tracking-wide text-sm">{student.full_name || 'Unregistered'}</td>
                  <td className="p-4 text-xs font-mono text-green-400">{student.whatsapp_number || 'N/A'}</td>
                  <td className="p-4 text-xs text-gray-400">{student.email || 'N/A'}</td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => removeStudent(student.id)}
                      className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-1 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                  {courses.map(course => {
                    const isEnrolled = enrollments.some(e => e.student_id === student.id && e.course_id === course.id);
                    return (
                      <td key={course.id} className="p-4 text-center">
                        <button 
                          onClick={() => toggleEnrollment(student.id, course.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-black tracking-wider uppercase transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                            isEnrolled 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                              : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                          }`}
                        >
                          {isEnrolled ? 'REVOKE' : 'GRANT'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4 + courses.length} className="p-8 text-center text-gray-500 font-mono text-sm">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: COURSES */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* Courses List */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-300 border-b border-gray-800 pb-2 mb-4">Active Revision Boxes</h2>
            {courses.map(c => (
              <div key={c.id} className="bg-[#14141a] border border-gray-800 p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start gap-4 hover:border-gray-600 transition-colors">
                <div className="flex-1">
                  <h3 className="text-lg font-black text-orange-400">{c.title} <span className="text-xs text-gray-500 ml-2 font-mono">ID: {c.id}</span></h3>
                  <p className="text-sm font-bold text-gray-300 mt-1">{c.sub} • {c.duration}</p>
                  <p className="text-xs text-gray-500 mt-2 max-w-xl leading-relaxed">{c.description}</p>
                  <p className="text-xs text-blue-400 mt-2 font-mono break-all">Video ID: {c.video_id || 'NULL'}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {c.topics && Array.isArray(c.topics) && c.topics.map((t: string, i: number) => (
                      <span key={i} className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-300 uppercase tracking-widest">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 shrink-0">
                  <button onClick={() => editCourse(c)} className="px-5 py-2.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 border border-blue-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors w-full">Edit</button>
                  <button onClick={() => deleteCourse(c.id)} className="px-5 py-2.5 bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors w-full">Delete</button>
                </div>
              </div>
            ))}
            {courses.length === 0 && <p className="text-gray-500 p-4 border border-gray-800 border-dashed rounded-xl text-center">No revision boxes available.</p>}
          </div>

          {/* Form Panel */}
          <div className="bg-[#14141a] border border-gray-800 p-6 md:p-8 rounded-xl shadow-lg sticky top-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-gray-300">
                {isEditingCourse ? 'Edit Box' : 'Create New Box'}
              </h2>
              {isEditingCourse && (
                <button onClick={resetForm} className="text-xs text-gray-400 hover:text-white underline tracking-wider uppercase font-bold">Cancel</button>
              )}
            </div>
            
            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Revision 1 Video Box" className="w-full bg-[#0b0b0f] border border-gray-700 rounded-lg p-3 text-sm font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Subtitle</label>
                <input required value={formData.sub} onChange={e => setFormData({...formData, sub: e.target.value})} placeholder="e.g. Model Paper 01 Review" className="w-full bg-[#0b0b0f] border border-gray-700 rounded-lg p-3 text-sm font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Duration Badge</label>
                <input required value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 1h 45m or Soon" className="w-full bg-[#0b0b0f] border border-gray-700 rounded-lg p-3 text-sm font-bold text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
                <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Interactive learning module." className="w-full bg-[#0b0b0f] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all leading-relaxed resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Topics (Comma separated)</label>
                <input required value={formData.topics} onChange={e => setFormData({...formData, topics: e.target.value})} placeholder="Algebra, Calculus, Trigonometry" className="w-full bg-[#0b0b0f] border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Video ID (Optional)</label>
                <input value={formData.video_id} onChange={e => setFormData({...formData, video_id: e.target.value})} placeholder="Vimeo/YouTube ID" className="w-full bg-[#0b0b0f] border border-gray-700 rounded-lg p-3 text-sm font-mono text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              </div>

              <button type="submit" className={`w-full text-white font-black uppercase tracking-widest p-4 rounded-lg mt-6 transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] ${isEditingCourse ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20' : 'bg-green-600 hover:bg-green-500 shadow-green-500/20'}`}>
                {isEditingCourse ? 'Save Changes' : 'Create Revision Box'}
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
