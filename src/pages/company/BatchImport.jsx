import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import useAuth from '../../hooks/useAuth';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';

export const BatchImport = () => {
  const { profile } = useAuth();
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(0);
  const fileInputRef = useRef(null);

  const TEMPLATE_HEADERS = "title,description,industry,location,employment_type,salary_min,salary_max,required_experience,required_qualification,field_of_study\n";

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_HEADERS], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talenthub_batch_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) return; // Only header or empty
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((h, i) => {
          row[h] = values[i] ? values[i].trim() : '';
        });
        
        // Basic validation
        const isValid = row.title && row.description && row.industry && row.location;
        return { data: row, isValid, error: isValid ? null : 'Missing required fields (title, description, industry, or location)' };
      });
      
      setParsedRows(rows);
    };
    reader.readAsText(uploadedFile);
  };

  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid).map(r => r.data);
    if (validRows.length === 0) return;
    
    setLoading(true);
    let successCount = 0;
    
    try {
      const insertPayloads = validRows.map(row => {
        const expMap = { '0': '0-2', '1': '0-2', '2': '0-2', '3': '3-5', '4': '3-5', '5': '3-5', '6': '6-9' };
        
        return {
          company_id: profile?.company_id,
          title: row.title,
          description: row.description,
          industry: row.industry,
          location: row.location,
          employment_type: row.employment_type || 'Full-time',
          salary_min: row.salary_min ? parseFloat(row.salary_min) : null,
          salary_max: row.salary_max ? parseFloat(row.salary_max) : null,
          required_experience: expMap[row.required_experience] || '0-2',
          required_qualification: row.required_qualification || 'Any',
          field_of_study: row.field_of_study || 'Any',
          status: 'open',
          public_token: Array.from(crypto.getRandomValues(new Uint8Array(8))).map((b) => b.toString(16).padStart(2, '0')).join(''),
        };
      });

      const { error } = await supabase.from('jobs').insert(insertPayloads);
      
      if (error) throw error;
      
      successCount = insertPayloads.length;
      setImported(successCount);
      setParsedRows([]);
      setFile(null);
      if(fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err) {
      console.error(err);
      alert('Import failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-display font-bold text-slate-900">Batch Import Jobs</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload a CSV file to post multiple jobs at once.</p>
      </div>

      {imported > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-green-800 font-semibold text-sm">
            <CheckCircle2 size={20} className="text-green-600" />
            Successfully imported {imported} jobs!
          </div>
          <Button onClick={() => setImported(0)} variant="outline">Import More</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col gap-4">
          <h2 className="font-bold text-slate-800 font-display">1. Download Template</h2>
          <p className="text-xs text-slate-500 font-sans leading-relaxed">
            Download our standard CSV template. Do not change the header row. Fill in your job details and save as a .csv file.
          </p>
          <button onClick={downloadTemplate} className="mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-primary text-primary hover:bg-primary/5 font-semibold text-sm transition-colors cursor-pointer">
            <FileText size={16} /> Download CSV Template
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-primary/20 p-6 shadow-sm flex flex-col items-center justify-center border-dashed relative">
          <input type="file" accept=".csv" onChange={handleFileUpload} ref={fileInputRef} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <UploadCloud size={32} className="text-primary mb-3" />
          <h2 className="font-bold text-slate-800 font-display">2. Upload File</h2>
          <p className="text-xs text-slate-500 font-sans mt-1 text-center px-4">
            {file ? <span className="font-semibold text-slate-900">{file.name}</span> : 'Drag & drop your completed CSV file here, or click to browse.'}
          </p>
        </div>
      </div>

      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-bold text-slate-900">Preview ({parsedRows.length} rows)</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">{parsedRows.filter(r => r.isValid).length} Valid</span>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">{parsedRows.filter(r => !r.isValid).length} Invalid</span>
              <Button onClick={handleImport} variant="primary" loading={loading} disabled={parsedRows.filter(r => r.isValid).length === 0} className="ml-2">
                <Play size={14} className="mr-1" /> Import Valid Jobs
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase text-slate-500 tracking-wider">
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                {parsedRows.slice(0, 10).map((row, i) => (
                  <tr key={i} className={row.isValid ? 'hover:bg-slate-50/50' : 'bg-red-50/50'}>
                    <td className="px-4 py-3">
                      {row.isValid ? <Badge variant="success">Valid</Badge> : <Badge variant="danger" title={row.error}>Invalid</Badge>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 truncate max-w-[150px]">{row.data.title || '-'}</td>
                    <td className="px-4 py-3 truncate max-w-[120px]">{row.data.industry || '-'}</td>
                    <td className="px-4 py-3">{row.data.location || '-'}</td>
                    <td className="px-4 py-3">{row.data.employment_type || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsedRows.length > 10 && (
             <div className="p-3 bg-slate-50 text-center text-xs font-semibold text-slate-500">
               + {parsedRows.length - 10} more rows
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchImport;
