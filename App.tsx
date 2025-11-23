
import React, { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Settings,
  Trash2,
  Calendar,
  Share2,
  Download,
  Printer,
  CheckCircle,
  Circle,
  Flag,
  Edit2,
  Search,
  GripVertical,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  CheckSquare,
  Square,
  X as XIcon
} from 'lucide-react';
import { AppSettings, Language, Task, Theme } from './types';
import { TRANSLATIONS, FLAG_COLORS } from './constants';
import { TaskForm } from './components/TaskForm';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { formatDateDisplay, exportTasks, handleShare } from './utils';
import { isSameDay, parseISO } from 'date-fns';

// --- Local Storage Hooks ---
const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};

// --- Constants ---
const COLOR_NAMES = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];

// --- Sorting Types ---
type SortOption = 'manual' | 'dueDate' | 'created' | 'priority' | 'dueToday';

// --- Sortable Task Item Component ---
interface SortableTaskItemProps {
  task: Task;
  language: Language;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onShare: (task: Task) => void;
  t: any;
  isSortingEnabled: boolean;
  selectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({ 
  task, 
  language, 
  onEdit, 
  onDelete, 
  onToggleComplete, 
  onShare, 
  t,
  isSortingEnabled,
  selectionMode,
  isSelected,
  onToggleSelect
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !isSortingEnabled || selectionMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  const { text: dateText, isOverdue } = formatDateDisplay(task.dueDate, language);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const prevCompleted = useRef(task.completed);

  useEffect(() => {
    // Only animate if transitioning from incomplete to complete
    if (task.completed && !prevCompleted.current) {
      setShouldAnimate(true);
      const timer = setTimeout(() => setShouldAnimate(false), 300);
      return () => clearTimeout(timer);
    }
    prevCompleted.current = task.completed;
  }, [task.completed]);

  const handleSelectionClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.stopPropagation();
      onToggleSelect(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleSelectionClick}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border p-4 mb-3 transition-all ${
        isSelected ? 'border-primary bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-100 dark:border-gray-700'
      } ${
        task.completed && !isSelected ? 'opacity-60 bg-gray-50 dark:bg-gray-900' : ''
      } ${shouldAnimate ? 'animate-pop ring-2 ring-green-500 ring-opacity-50' : ''} ${selectionMode ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Selection Checkbox (Visible in Selection Mode) */}
        {selectionMode && (
          <div className="mt-1.5 transition-all animate-in fade-in slide-in-from-left-2 duration-200">
             {isSelected ? (
                <div className="text-primary"><CheckSquare size={24} /></div>
             ) : (
                <div className="text-gray-300 dark:text-gray-600"><Square size={24} /></div>
             )}
          </div>
        )}

        {/* Drag Handle - Visible only on group hover and when sorting is manual AND not in selection mode */}
        {isSortingEnabled && !selectionMode && (
          <div 
            {...attributes} 
            {...listeners} 
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <GripVertical size={20} />
          </div>
        )}

        {/* Checkbox - Left side (Hidden if selecting) */}
        {!selectionMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task.id);
            }}
            className={`mt-1 transition-all duration-300 transform active:scale-90 ${
              task.completed ? 'text-green-500 scale-110' : 'text-gray-300 dark:text-gray-600 hover:text-primary hover:scale-105'
            }`}
            title={task.completed ? t.markUndone : t.markDone}
          >
            {task.completed ? <CheckCircle size={24} /> : <Circle size={24} />}
          </button>
        )}

        {/* Content - Click to Expand (disabled in selection mode) */}
        <div 
          className="flex-1 min-w-0" 
          onClick={(e) => {
            if (!selectionMode) {
               e.stopPropagation();
               setIsExpanded(!isExpanded);
            }
          }}
        >
          <div className="flex justify-between items-start gap-2">
            <h3 
              className={`font-semibold text-lg pr-2 transition-all duration-500 ${
                task.completed 
                  ? 'text-gray-500 line-through dark:text-gray-500 decoration-green-500 decoration-2' 
                  : 'text-gray-800 dark:text-gray-100'
              } ${isExpanded ? 'whitespace-pre-wrap' : 'truncate'} ${shouldAnimate ? 'text-green-600 dark:text-green-400 scale-[1.02] origin-left' : ''}`}
            >
              {task.subject}
            </h3>
            {task.flagColor && (
              <Flag size={16} fill={task.flagColor} stroke={task.flagColor} className="shrink-0 mt-1.5" />
            )}
          </div>
          
          <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
            {task.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm">
            {dateText && (
               <div className={`flex items-center gap-1 font-medium ${
                 task.completed 
                  ? 'text-gray-400' 
                  : isOverdue 
                    ? 'text-red-500 animate-pulse' 
                    : 'text-green-600 dark:text-green-400'
               }`}>
                 <Calendar size={14} />
                 <span>{isOverdue && !task.completed ? `${t.overdue}: ` : ''}{dateText}</span>
               </div>
            )}
            
            {/* Expansion Indicator */}
            {!selectionMode && (
              <div className="text-gray-400 dark:text-gray-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto sm:ml-0">
                 {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            )}
          </div>
        </div>

        {/* Actions - Visible on hover/focus (Hidden in Selection Mode) */}
        {!selectionMode && (
          <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {/* Explicit Complete Button */}
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleComplete(task.id); }}
              className={`p-2 rounded-lg transition-colors ${
                task.completed 
                  ? 'text-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40' 
                  : 'text-gray-500 bg-gray-100 dark:bg-gray-700 hover:text-green-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title={task.completed ? t.markUndone : t.markDone}
            >
              {task.completed ? <RotateCcw size={16} /> : <Check size={16} />}
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }} 
              className="p-2 text-gray-500 hover:text-primary bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title={t.editTask}
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} 
              className="p-2 text-gray-500 hover:text-red-500 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title={t.deleteTask}
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onShare(task); }} 
              className="p-2 text-gray-500 hover:text-blue-500 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              title={t.share}
            >
              <Share2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


// --- Main App Component ---
export default function App() {
  // State
  const [tasks, setTasks] = useStickyState<Task[]>([], 'noam-todo-tasks');
  const [settings, setSettings] = useStickyState<AppSettings>({
    language: Language.EN,
    theme: Theme.DARK,
    userLogo: null,
    userName: 'User',
  }, 'noam-todo-settings');
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('manual');
  
  // Multi-select State
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  // Export Menu State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selection when mode changes
  useEffect(() => {
    if (!selectionMode) {
      setSelectedTaskIds(new Set());
    }
  }, [selectionMode]);

  // Sensors for DnD with activation constraint to fix button clicking issues
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.theme === Theme.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Translations
  const t = TRANSLATIONS[settings.language];
  const isRTL = settings.language === Language.HE;

  // Handlers
  const handleAddTask = (taskData: any) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...taskData } : t));
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        completed: false,
        order: tasks.length,
        ...taskData,
      };
      setTasks([newTask, ...tasks]);
    }
    setEditingTask(undefined);
  };

  const handleDeleteTask = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t.confirmDeleteTitle,
      message: t.confirmDeleteMessage,
      onConfirm: () => {
        setTasks(tasks.filter(t => t.id !== id));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleToggleComplete = (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        const completed = !t.completed;
        return { ...t, completed };
      }
      return t;
    });
    setTasks(updatedTasks);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // Only allow drag reordering if manual sort is active
    if (sortBy === 'manual' && over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((t) => t.id === active.id);
        const newIndex = items.findIndex((t) => t.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShareTask = (task: Task) => {
    const status = task.completed ? "✅ Completed" : "⬜ To Do";
    const text = `${status}: ${task.subject}\n${task.description}\nDue: ${formatDateDisplay(task.dueDate, settings.language).text}`;
    handleShare("My Task", text);
  };

  // Selection Handlers
  const toggleTaskSelection = (id: string) => {
    const newSelected = new Set(selectedTaskIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTaskIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedTaskIds.size === 0) return;
    
    setConfirmDialog({
      isOpen: true,
      title: t.confirmDeleteTitle,
      message: t.confirmDeleteMultipleMessage.replace('{count}', selectedTaskIds.size.toString()),
      onConfirm: () => {
        setTasks(tasks.filter(t => !selectedTaskIds.has(t.id)));
        setSelectedTaskIds(new Set());
        setSelectionMode(false);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleBulkComplete = () => {
    const updatedTasks = tasks.map(t => {
      if (selectedTaskIds.has(t.id)) {
        return { ...t, completed: true };
      }
      return t;
    });
    setTasks(updatedTasks);
    setSelectionMode(false);
  };

  const handleBulkMarkIncomplete = () => {
    const updatedTasks = tasks.map(t => {
      if (selectedTaskIds.has(t.id)) {
        return { ...t, completed: false };
      }
      return t;
    });
    setTasks(updatedTasks);
    setSelectionMode(false);
  };

  const handleBulkShare = () => {
    // Share as a list
    const selectedTasksList = tasks.filter(t => selectedTaskIds.has(t.id));
    const text = selectedTasksList.map(task => {
      const status = task.completed ? "✅" : "⬜";
      return `${status} ${task.subject}`;
    }).join('\n');
    
    handleShare("My Tasks", text);
  };

  // Filter & Sort Logic
  const processedTasks = React.useMemo(() => {
    // 1. Filter by search (Subject, Description, and Flag Color)
    let result = tasks.filter(task => {
      const query = searchQuery.toLowerCase();
      // Map flag color hex to name
      const colorIndex = FLAG_COLORS.indexOf(task.flagColor);
      const colorName = colorIndex !== -1 ? COLOR_NAMES[colorIndex] : '';

      return (
        task.subject.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        colorName.includes(query)
      );
    });

    // 2. Filter by Due Today if selected
    if (sortBy === 'dueToday') {
      result = result.filter(task => {
        if (!task.dueDate) return false;
        return isSameDay(parseISO(task.dueDate), new Date());
      });
      // Sort by specific time today
      result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    // 3. Sort for other methods
    else if (sortBy !== 'manual') {
      result.sort((a, b) => {
        if (sortBy === 'dueDate') {
          // Earliest due date first. Empty due dates last.
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'created') {
          // Newest created first
          return b.createdAt - a.createdAt;
        }
        if (sortBy === 'priority') {
          // Priority based on FLAG_COLORS index. Assuming index 0 (Red) is highest.
          const pA = FLAG_COLORS.indexOf(a.flagColor);
          const pB = FLAG_COLORS.indexOf(b.flagColor);
          return pA - pB;
        }
        return 0;
      });
    }
    
    return result;
  }, [tasks, searchQuery, sortBy]);

  return (
    <div className={`min-h-screen flex flex-col ${isRTL ? 'font-[sans-serif]' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* --- Header --- */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm no-print">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white overflow-hidden shadow-lg">
                  {settings.userLogo ? (
                    <img src={settings.userLogo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-lg">AI</span>
                  )}
               </div>
               <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                 {t.appTitle}
               </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <Settings size={24} />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
             {/* Search Bar */}
             <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                   <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
                />
             </div>

             {/* Sort Section */}
             <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className={`text-sm font-medium whitespace-nowrap transition-colors ${
                  sortBy !== 'manual' ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {t.sortBy}
                </div>
                <div className="relative min-w-[160px] flex-1 sm:flex-none">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                     <ArrowUpDown size={16} />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full pl-10 pr-8 py-2 appearance-none rounded-xl bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all text-gray-900 dark:text-white cursor-pointer"
                  >
                    <option value="manual">{t.sortManual}</option>
                    <option value="dueDate">{t.sortDueDate}</option>
                    <option value="dueToday">{t.sortDueToday}</option>
                    <option value="created">{t.sortCreated}</option>
                    <option value="priority">{t.sortPriority}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-24">
        
        {/* Actions Bar */}
        <div className="flex flex-wrap justify-between items-center gap-2 mb-6 no-print">
           <div className="flex gap-2">
             <button 
                onClick={() => setSelectionMode(!selectionMode)}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors ${
                  selectionMode 
                    ? 'bg-primary text-white border-primary' 
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
             >
               {selectionMode ? <CheckSquare size={16} /> : <CheckSquare size={16} />}
               {selectionMode ? t.cancelSelection : t.select}
             </button>
           </div>

           <div className="flex gap-2">
             <div className="relative" ref={exportMenuRef}>
               <button 
                 onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} 
                 className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
               >
                 <Download size={16} /> {t.exportAll} <ChevronDown size={14} />
               </button>
               {isExportMenuOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                   <button 
                     onClick={() => { exportTasks(tasks, 'json'); setIsExportMenuOpen(false); }}
                     className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                   >
                     Export as JSON
                   </button>
                   <button 
                     onClick={() => { exportTasks(tasks, 'csv'); setIsExportMenuOpen(false); }}
                     className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                   >
                     Export as CSV
                   </button>
                 </div>
               )}
             </div>

             <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
               <Printer size={16} /> {t.printAll}
             </button>
           </div>
        </div>

        {/* Task List */}
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={processedTasks.map(t => t.id)} 
            strategy={verticalListSortingStrategy}
            disabled={sortBy !== 'manual'}
          >
            <div className="space-y-3">
              {processedTasks.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">{t.noTasks}</p>
                </div>
              ) : (
                processedTasks.map(task => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    language={settings.language}
                    onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
                    onDelete={handleDeleteTask}
                    onToggleComplete={handleToggleComplete}
                    onShare={handleShareTask}
                    t={t}
                    isSortingEnabled={sortBy === 'manual'}
                    selectionMode={selectionMode}
                    isSelected={selectedTaskIds.has(task.id)}
                    onToggleSelect={toggleTaskSelection}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {/* --- Bulk Action Bar --- */}
      {selectionMode && selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 inset-x-0 mx-auto max-w-lg px-4 z-50 animate-in slide-in-from-bottom-6 duration-300 no-print">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-2xl p-3 flex items-center justify-between">
             <div className="flex items-center gap-3 px-2">
                <span className="bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {selectedTaskIds.size}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                  {t.selected}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={handleBulkComplete}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title={t.completeSelected}
                >
                  <CheckCircle size={20} />
                </button>
                
                {tasks.some(t => selectedTaskIds.has(t.id) && t.completed) && (
                  <button 
                    onClick={handleBulkMarkIncomplete}
                    className="p-2 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    title={t.markUndone}
                  >
                    <RotateCcw size={20} />
                  </button>
                )}

                <button 
                  onClick={handleBulkShare}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title={t.shareSelected}
                >
                  <Share2 size={20} />
                </button>
                <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <button 
                  onClick={handleBulkDelete}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={t.deleteSelected}
                >
                  <Trash2 size={20} />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* --- FAB (Floating Action Button) --- */}
      {!selectionMode && (
        <button
          onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary hover:bg-indigo-600 text-white rounded-full shadow-lg hover:shadow-primary/50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 no-print z-30"
        >
          <Plus size={28} />
        </button>
      )}

      {/* --- Footer --- */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto no-print">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t.copyright}
          </p>
          <a 
            href="mailto:gold.noam@gmail.com" 
            className="text-sm text-primary hover:text-secondary transition-colors inline-flex items-center gap-1"
          >
            {t.feedback}: gold.noam@gmail.com
          </a>
        </div>
      </footer>

      {/* --- Modals --- */}
      <TaskForm
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
        initialData={editingTask}
        translations={TRANSLATIONS}
        language={settings.language}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        translations={TRANSLATIONS}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        translations={TRANSLATIONS}
        language={settings.language}
      />
    </div>
  );
}
