import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/shared/Button';
import Input from '../../components/shared/Input';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  PlusCircle, 
  ChevronRight,
  Info 
} from 'lucide-react';

export const CreateJob = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Gaborone',
    industry: 'Banking, Finance & Insurance',
    employmentType: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    requiredExperience: '3-5',
    requiredQualification: "Bachelor's Degree",
    fieldOfStudy: '',
    applicationEmail: '',
  });

  // Skills additions
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['Financial Analysis', 'Excel VBA', 'Reporting']);

  // Pre-screening questions list
  const [questions, setQuestions] = useState([
    { id: '1', question_text: 'Are you legally eligible to work in Botswana?', question_type: 'multiple_choice', options: ['Yes', 'No'] },
    { id: '2', question_text: 'Describe your experience with financial modeling.', question_type: 'free_text', options: null }
  ]);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('free_text');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills(prev => [...prev, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;

    const newQ = {
      id: Date.now().toString(),
      question_text: newQuestionText,
      question_type: newQuestionType,
      options: newQuestionType === 'multiple_choice' ? newQuestionOptions.split(',').map(o => o.trim()) : null
    };

    setQuestions(prev => [...prev, newQ]);
    setNewQuestionText('');
    setNewQuestionOptions('');
  };

  const handleRemoveQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleGenerateAiQuestions = () => {
    if (!formData.title) {
      alert('Please fill out the job title first to get AI questions.');
      return;
    }
    // Mocking AI questions suggestions based on job title
    setQuestions([
      { id: 'ai-1', question_text: `What is your approach to resolving complex technical issues in a ${formData.title} role?`, question_type: 'free_text', options: null },
      { id: 'ai-2', question_text: `Do you have at least 3 years of hands-on experience in this industry?`, question_type: 'multiple_choice', options: ['Yes', 'No'] },
      { id: 'ai-3', question_text: `How many years of active leadership or management experience do you possess?`, question_type: 'multiple_choice', options: ['0-2 years', '3-5 years', '5+ years'] }
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Insert job in DB
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          company_id: profile?.company_id,
          posted_by: user.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          industry: formData.industry,
          employment_type: formData.employmentType,
          salary_min: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
          salary_max: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
          required_skills: skills,
          required_experience: formData.requiredExperience,
          required_qualification: formData.requiredQualification,
          field_of_study: formData.fieldOfStudy,
          application_email: formData.applicationEmail || user.email,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Add screening questions if any
      if (questions.length > 0) {
        const insertQs = questions.map((q, idx) => ({
          job_id: data.id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          sort_order: idx + 1
        }));

        const { error: qError } = await supabase
          .from('screening_questions')
          .insert(insertQs);

        if (qError) throw qError;
      }

      navigate('/company/jobs');
    } catch (err) {
      console.error(err);
      setErrors({ form: err.message || 'Failed to submit job posting.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3 mb-2">
        <button
          onClick={() => navigate('/company/jobs')}
          className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold font-display text-slate-900">Post a Job Role</h1>
          <p className="text-xs text-slate-500">Configure parameters, match scoring requirements, and pre-screening checks.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details forms */}
        <div className="lg:col-span-2 flex flex-col gap-4 bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Job Specifications</h3>
          
          {errors.form && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-xs font-medium">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Job Title"
              placeholder="e.g. Senior Financial Analyst"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              disabled={loading}
            />

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
                className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Graduate Trainee</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option>Gaborone</option>
                <option>Francistown</option>
                <option>Maun</option>
                <option>Mogoditshane</option>
                <option>Molepolole</option>
                <option>Serowe</option>
                <option>Palapye</option>
                <option>Selebi-Phikwe</option>
                <option>Jwaneng</option>
                <option>Kasane</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option>Banking, Finance & Insurance</option>
                <option>Mining & Diamonds</option>
                <option>Tourism & Hospitality</option>
                <option>Agriculture & Beef</option>
                <option>Telecommunications & ICT</option>
                <option>Government & Public Sector</option>
                <option>Manufacturing</option>
              </select>
            </div>
          </div>

          <Input
            label="Job Description"
            type="textarea"
            placeholder="Write role outline, responsibilities, and benefits..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
            disabled={loading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              label="Minimum Salary (BWP)"
              type="number"
              placeholder="e.g. 15000"
              value={formData.salaryMin}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
            />
            <Input
              label="Maximum Salary (BWP)"
              type="number"
              placeholder="e.g. 25000"
              value={formData.salaryMax}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
            />
          </div>

          {/* Core Match Factors */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-primary mt-4 border-t border-slate-100 pt-4 mb-2">
            Match Filters & Scoring Weights
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Required Qualification</label>
              <select
                value={formData.requiredQualification}
                onChange={(e) => setFormData(prev => ({ ...prev, requiredQualification: e.target.value }))}
                className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option>BGCSE / Secondary</option>
                <option>Diploma / Associate</option>
                <option>Bachelor's Degree</option>
                <option>Master's Degree</option>
                <option>PhD / Doctorate</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Required Experience</label>
              <select
                value={formData.requiredExperience}
                onChange={(e) => setFormData(prev => ({ ...prev, requiredExperience: e.target.value }))}
                className="w-full px-4 py-2.5 text-xs font-sans rounded-xl border bg-white text-slate-800 border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="0-2">Entry Level (0-2 years)</option>
                <option value="3-5">Mid Level (3-5 years)</option>
                <option value="6-9">Senior Level (6-9 years)</option>
                <option value="10+">Executive (10+ years)</option>
              </select>
            </div>

            <div className="col-span-full">
              <Input
                label="Preferred Field of Study"
                placeholder="e.g. Accounting, Finance, Economics"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Sidebar: Skills & Screening questions */}
        <div className="flex flex-col gap-6">
          
          {/* Skills Management */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Required Candidate Skills</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. ACCA)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                className="flex-1 px-4 py-2 text-xs font-sans rounded-xl border bg-slate-50 border-slate-200 focus:outline-none text-slate-800 placeholder-slate-400"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="p-2 bg-primary text-white rounded-xl hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[50px] border border-slate-100 p-2 rounded-xl bg-slate-50/50">
              {skills.length === 0 ? (
                <span className="text-[10px] text-slate-400 font-sans">No skills selected yet.</span>
              ) : (
                skills.map((s) => (
                  <span 
                    key={s}
                    className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary flex items-center gap-1.5"
                  >
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="text-primary hover:text-red-500 font-bold">×</button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Pre-Screening Questions */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Pre-screening Questions</h3>
              <button
                type="button"
                onClick={handleGenerateAiQuestions}
                className="text-[9px] font-bold text-primary flex items-center gap-0.5 uppercase hover:underline cursor-pointer"
              >
                <Sparkles size={10} /> AI Generate
              </button>
            </div>

            {/* Added questions list */}
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {questions.map((q) => (
                <div key={q.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl relative group">
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  <p className="text-[11px] font-bold text-slate-800 pr-5 leading-normal">{q.question_text}</p>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5 block">
                    Type: {q.question_type.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>

            {/* Add manual question form */}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2.5">
              <input
                type="text"
                placeholder="Type screening question..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="w-full px-3 py-2 text-xs font-sans rounded-xl border bg-slate-50 border-slate-200 focus:outline-none text-slate-800 placeholder-slate-400"
              />
              
              <div className="flex gap-2 items-center">
                <select
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value)}
                  className="px-3 py-1.5 text-[10px] font-sans rounded-lg border bg-white border-slate-200 text-slate-800 focus:outline-none"
                >
                  <option value="free_text">Free Text</option>
                  <option value="multiple_choice">Multiple Choice</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <PlusCircle size={12} /> Add Question
                </button>
              </div>

              {newQuestionType === 'multiple_choice' && (
                <input
                  type="text"
                  placeholder="Options comma-separated (e.g. Yes, No)"
                  value={newQuestionOptions}
                  onChange={(e) => setNewQuestionOptions(e.target.value)}
                  className="w-full px-3 py-2 text-[10px] font-sans rounded-xl border bg-slate-50 border-slate-200 focus:outline-none text-slate-800 placeholder-slate-400"
                />
              )}
            </div>

          </div>

          {/* Submitting buttons */}
          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/company/jobs')}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              Publish Post <ChevronRight size={16} />
            </Button>
          </div>

        </div>

      </form>

    </div>
  );
};

export default CreateJob;
