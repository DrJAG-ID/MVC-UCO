import React, { useState } from 'react';
import { AbsenceRecord } from '../types';
import { ucoStore } from '../models/store';
import { InfoTooltip } from './InfoTooltip';
import {
  CalendarCheck2,
  Edit2,
  Trash2,
  X,
  Search,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { getCurrentDateStamp } from '../controllers/idGenerator';

export const AdminAbsencePage: React.FC = () => {
  const [records, setRecords] = useState<AbsenceRecord[]>(() => ucoStore.getMainAbsences());
  const [searchTerm, setSearchTerm] = useState('');

  // Edit modal
  const [editingRecord, setEditingRecord] = useState<AbsenceRecord | null>(null);
  const [editUserNumber, setEditUserNumber] = useState('');
  const [editRealName, setEditRealName] = useState('');

  // Photo viewer modal
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const refreshData = () => {
    setRecords([...ucoStore.getMainAbsences()]);
  };

  const handleDelete = (no: number) => {
    if (window.confirm(`Hapus catatan presensi nomor urut #${no}?`)) {
      ucoStore.deleteMainAbsence(no);
      refreshData();
    }
  };

  const handleOpenEdit = (rec: AbsenceRecord) => {
    setEditingRecord(rec);
    setEditUserNumber(rec.userNumber);
    setEditRealName(rec.realName);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    ucoStore.updateMainAbsence(editingRecord.no, editUserNumber, editRealName);
    setEditingRecord(null);
    refreshData();
  };

  // Export records as CSV
  const handleExportCsv = () => {
    const headers = ['No', 'Usernumber/ID', 'Real Name', 'Date Stamp'];
    const rows = records.map(r => [r.no, `"${r.userNumber}"`, `"${r.realName}"`, `"${r.dateStamp}"`]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `uco_main_absence_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = records.filter(
    (r) =>
      r.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.dateStamp.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/95 border-2 border-[rgb(233,251,102)] shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#3f48cc] tracking-tight">
              Data Proses Presensi (/databsen)
            </h2>
            <InfoTooltip content="Tabel data presensi harian dari Absence-page yang tersimpan di sqlite3 main-absence. Opsi edit ID/nama dan delete record." />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Log presensi real-life harian beserta foto thumbnail dan stempel waktu
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ID, Nama, Tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#3f48cc]"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm whitespace-nowrap active:scale-95"
            title="Unduh data presensi format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            type="button"
            onClick={refreshData}
            title="Segarkan data presensi"
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Table: header column: no, usernumber/ID, real name, thumbnail photo, date stamp, options */}
      <div className="bg-white/95 rounded-xl border-2 border-slate-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#3f48cc] text-white border-b-2 border-[rgb(233,251,102)] text-xs uppercase font-extrabold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-14">No</th>
                <th className="py-3 px-4">Usernumber / ID</th>
                <th className="py-3 px-4">Real Name</th>
                <th className="py-3 px-4 text-center">Thumbnail Photo</th>
                <th className="py-3 px-4">Date Stamp</th>
                <th className="py-3 px-4 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ada rekaman presensi ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.no} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-500 tabular-nums">
                      {item.no}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-[#3f48cc]">
                      {item.userNumber}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.realName}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setPreviewPhoto(item.thumbnailPhoto)}
                        title="Klik untuk perbesar foto presensi"
                        className="inline-block p-1 rounded-lg border border-slate-200 hover:border-[#3f48cc] transition-all bg-white"
                      >
                        <img
                          src={item.thumbnailPhoto}
                          alt={item.realName}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      </button>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700 text-xs tabular-nums whitespace-nowrap">
                      {item.dateStamp}
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="px-2.5 py-1 rounded bg-[#3f48cc] hover:bg-[#3239a0] text-white font-bold text-xs border border-[rgb(233,251,102)] transition-all"
                        title="Edit nomor ID dan nama pengguna"
                      >
                        Ubah
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.no)}
                        className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all"
                        title="Hapus data presensi"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-4 border-[rgb(233,251,102)] animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#3f48cc]" />
                <h3 className="font-extrabold text-slate-800 text-base">
                  Ubah Presensi #{editingRecord.no}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Usernumber / ID
                </label>
                <input
                  type="text"
                  required
                  value={editUserNumber}
                  onChange={(e) => setEditUserNumber(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm focus:border-[#3f48cc] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Real Name
                </label>
                <input
                  type="text"
                  required
                  value={editRealName}
                  onChange={(e) => setEditRealName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-[#3f48cc] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Date Stamp
                </label>
                <div className="mt-1 px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs text-slate-600">
                  {editingRecord.dateStamp}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#3f48cc] text-white font-bold text-xs border border-[rgb(233,251,102)]"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="bg-white p-3 rounded-2xl max-w-sm w-full border-4 border-[rgb(233,251,102)]">
            <img
              src={previewPhoto}
              alt="Preview Presensi"
              className="w-full h-auto rounded-lg object-contain"
            />
            <div className="text-center mt-2 text-xs font-bold text-slate-600">
              Klik di mana saja untuk menutup
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
