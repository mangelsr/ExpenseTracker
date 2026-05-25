import React, { createContext, useContext, useState, useEffect, FormEvent } from "react";
import { ApplianceLog } from "../../types";
import {
  getAllApplianceLogs,
  addApplianceLog,
  updateApplianceLog,
  deleteApplianceLog
} from "../../utils/database";

export interface AppliancesContextType {
  logs: ApplianceLog[];
  loading: boolean;
  
  // Form State
  editingId: number | undefined;
  applianceName: string;
  type: 'buy' | 'installation' | 'maintenance';
  date: string;
  dateType: 'exact' | 'estimated';
  performer: string;
  cost: string;
  notes: string;
  parentId: number | undefined;

  // File Upload State
  fileBase64: string | undefined;
  fileName: string | undefined;
  fileType: string | undefined;

  // Filters State
  searchQuery: string;
  typeFilter: string;

  // Setters
  setEditingId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setApplianceName: React.Dispatch<React.SetStateAction<string>>;
  setType: React.Dispatch<React.SetStateAction<'buy' | 'installation' | 'maintenance'>>;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  setDateType: React.Dispatch<React.SetStateAction<'exact' | 'estimated'>>;
  setPerformer: React.Dispatch<React.SetStateAction<string>>;
  setCost: React.Dispatch<React.SetStateAction<string>>;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
  setParentId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setFileBase64: React.Dispatch<React.SetStateAction<string | undefined>>;
  setFileName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setFileType: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setTypeFilter: React.Dispatch<React.SetStateAction<string>>;

  // Actions
  loadLogs: () => Promise<void>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAttachedFile: () => void;
  handleTypeChange: (newType: 'buy' | 'installation' | 'maintenance') => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  handleEdit: (log: ApplianceLog) => void;
  handleDelete: (id: number) => Promise<void>;
  resetForm: () => void;

  // Derived state
  filteredLogs: ApplianceLog[];
  totals: {
    buy: number;
    installation: number;
    maintenance: number;
    total: number;
  };
}

const AppliancesContext = createContext<AppliancesContextType | undefined>(undefined);

export const AppliancesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<ApplianceLog[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [applianceName, setApplianceName] = useState("");
  const [type, setType] = useState<'buy' | 'installation' | 'maintenance'>('buy');
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dateType, setDateType] = useState<'exact' | 'estimated'>('exact');
  const [performer, setPerformer] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");
  const [parentId, setParentId] = useState<number | undefined>(undefined);

  // File Upload State
  const [fileBase64, setFileBase64] = useState<string | undefined>(undefined);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileType, setFileType] = useState<string | undefined>(undefined);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getAllApplianceLogs();
      // Sort by date descending
      setLogs(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error("Error al cargar registros de electrodomésticos", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to ~3MB to prevent IndexDB size limits
    if (file.size > 3 * 1024 * 1024) {
      alert("El archivo es demasiado grande. El límite de tamaño es de 3 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
      setFileName(file.name);
      setFileType(file.type);
    };
    reader.onerror = () => {
      alert("Error al leer el archivo.");
    };
    reader.readAsDataURL(file);
  };

  const removeAttachedFile = () => {
    setFileBase64(undefined);
    setFileName(undefined);
    setFileType(undefined);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleTypeChange = (newType: 'buy' | 'installation' | 'maintenance') => {
    setType(newType);
    if (newType === 'buy') {
      setParentId(undefined);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!applianceName || !date || !type || !performer || !cost) {
      alert("Por favor completa los campos requeridos.");
      return;
    }

    const logData: ApplianceLog = {
      applianceName,
      type,
      date,
      dateType,
      performer,
      cost: parseFloat(cost),
      notes: notes || undefined,
      fileBase64,
      fileName,
      fileType,
      parentId: type !== 'buy' ? parentId : undefined
    };

    try {
      if (editingId !== undefined) {
        logData.id = editingId;
        await updateApplianceLog(logData);
        alert("Registro actualizado con éxito");
      } else {
        await addApplianceLog(logData);
        alert("Registro agregado con éxito");
      }

      resetForm();
      await loadLogs();
    } catch (error) {
      console.error("Error al guardar registro", error);
      alert("Hubo un error al guardar el registro.");
    }
  };

  const handleEdit = (log: ApplianceLog) => {
    setEditingId(log.id);
    setApplianceName(log.applianceName);
    setType(log.type);
    setDate(log.date);
    setDateType(log.dateType);
    setPerformer(log.performer);
    setCost(log.cost.toString());
    setNotes(log.notes || "");
    setFileBase64(log.fileBase64);
    setFileName(log.fileName);
    setFileType(log.fileType);
    setParentId(log.parentId);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro?")) {
      try {
        await deleteApplianceLog(id);

        // Also cleanup related children parentId references
        const relatedLogs = logs.filter(l => l.parentId === id);
        for (const childLog of relatedLogs) {
          await updateApplianceLog({
            ...childLog,
            parentId: undefined
          });
        }

        if (editingId === id) {
          resetForm();
        }
        await loadLogs();
      } catch (error) {
        console.error("Error al eliminar registro", error);
      }
    }
  };

  const resetForm = () => {
    setEditingId(undefined);
    setApplianceName("");
    setType("buy");
    setDate(new Date().toISOString().split("T")[0]);
    setDateType("exact");
    setPerformer("");
    setCost("");
    setNotes("");
    setFileBase64(undefined);
    setFileName(undefined);
    setFileType(undefined);
    setParentId(undefined);
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Calculations for Summary
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.applianceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totals = logs.reduce((acc, log) => {
    if (log.type === "buy") acc.buy += log.cost;
    else if (log.type === "installation") acc.installation += log.cost;
    else if (log.type === "maintenance") acc.maintenance += log.cost;
    acc.total += log.cost;
    return acc;
  }, { buy: 0, installation: 0, maintenance: 0, total: 0 });

  return (
    <AppliancesContext.Provider
      value={{
        logs,
        loading,
        editingId,
        applianceName,
        type,
        date,
        dateType,
        performer,
        cost,
        notes,
        parentId,
        fileBase64,
        fileName,
        fileType,
        searchQuery,
        typeFilter,
        setEditingId,
        setApplianceName,
        setType,
        setDate,
        setDateType,
        setPerformer,
        setCost,
        setNotes,
        setParentId,
        setFileBase64,
        setFileName,
        setFileType,
        setSearchQuery,
        setTypeFilter,
        loadLogs,
        handleFileChange,
        removeAttachedFile,
        handleTypeChange,
        handleSubmit,
        handleEdit,
        handleDelete,
        resetForm,
        filteredLogs,
        totals
      }}
    >
      {children}
    </AppliancesContext.Provider>
  );
};

export const useAppliances = () => {
  const context = useContext(AppliancesContext);
  if (context === undefined) {
    throw new Error("useAppliances must be used within an AppliancesProvider");
  }
  return context;
};
