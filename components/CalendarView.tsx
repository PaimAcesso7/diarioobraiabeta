import React, { useState, useMemo } from 'react';
import { Project } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, DocumentArrowDownIcon, PrinterIcon, CheckIcon } from './icons';

interface CalendarViewProps {
    project: Project;
    onSelectDate: (date: string) => void;
    onPrintSelected: (dates: string[]) => void;
}

const formatDateToKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const CalendarView: React.FC<CalendarViewProps> = ({ project, onSelectDate, onPrintSelected }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    
    // New state for picker view: 'days', 'months', 'years'
    const [pickerView, setPickerView] = useState<'days' | 'months' | 'years'>('days');
    
    const loggedDays = useMemo(() => {
        const days = new Set<string>();
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(`logData-${project.id}-`) && key.endsWith('-info')) {
                const dateStr = key.substring(project.id.length + 9, key.length - 5);
                days.add(dateStr);
            }
        }
        return days;
    }, [project.id, currentDate]);

    const handleDateClick = (date: Date) => {
        const dateKey = formatDateToKey(date);
        if (isSelectionMode) {
            if (loggedDays.has(dateKey)) { // Only allow selecting days with logs
                setSelectedDates(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(dateKey)) {
                        newSet.delete(dateKey);
                    } else {
                        newSet.add(dateKey);
                    }
                    return newSet;
                });
            }
        } else {
            onSelectDate(dateKey);
        }
    };
    
    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedDates(new Set());
    };
    
    const handlePrintSelectedClick = () => {
        if (selectedDates.size === 0) {
            alert('Por favor, selecione pelo menos um dia para imprimir.');
            return;
        }
        onPrintSelected(Array.from(selectedDates).sort());
        setIsSelectionMode(false);
        setSelectedDates(new Set());
    };

    const changeDate = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (pickerView === 'days') newDate.setMonth(newDate.getMonth() + amount);
            if (pickerView === 'months') newDate.setFullYear(newDate.getFullYear() + amount);
            if (pickerView === 'years') newDate.setFullYear(newDate.getFullYear() + amount * 10);
            return newDate;
        });
    };

    const startYearOfDecade = useMemo(() => Math.floor(currentDate.getFullYear() / 10) * 10, [currentDate]);

    const renderHeader = () => {
        let title: React.ReactNode;
        switch (pickerView) {
            case 'years':
                title = `${startYearOfDecade} - ${startYearOfDecade + 9}`;
                break;
            case 'months':
                title = <button onClick={() => setPickerView('years')} className="hover:text-brand-indigo-light transition">{currentDate.getFullYear()}</button>;
                break;
            case 'days':
            default:
                title = (
                    <>
                        <button onClick={() => setPickerView('months')} className="hover:text-brand-indigo-light transition capitalize">
                            {currentDate.toLocaleString('pt-BR', { month: 'long' })}
                        </button>
                        <button onClick={() => setPickerView('years')} className="hover:text-brand-indigo-light transition">
                            {currentDate.getFullYear()}
                        </button>
                    </>
                );
        }

        return (
            <div className="flex items-center gap-4">
                <button onClick={() => changeDate(-1)} className="p-2 bg-brand-indigo text-white rounded-full hover:bg-indigo-700 transition print:hidden">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary text-center w-48 flex justify-center gap-2">
                    {title}
                </div>
                <button onClick={() => changeDate(1)} className="p-2 bg-brand-indigo text-white rounded-full hover:bg-indigo-700 transition print:hidden">
                    <ChevronRightIcon className="h-6 w-6" />
                </button>
            </div>
        );
    };

    const renderDaysGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-start-${i}`} className="border-r border-b border-gray-200 dark:border-dark-border"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = formatDateToKey(date);
            const hasLog = loggedDays.has(dateKey);
            const isSelected = selectedDates.has(dateKey);
            
            let cellClass = `border-r border-b border-gray-200 dark:border-dark-border p-2 min-h-[120px] transition-colors duration-200 flex flex-col relative ${isSelectionMode && !hasLog ? 'bg-gray-50 dark:bg-gray-800' : 'cursor-pointer'}`;
            
            if (isSelected) {
                cellClass += ' !bg-blue-500 ring-2 ring-blue-700 !text-white print:!bg-transparent print:!text-black print:ring-1 print:ring-black';
            } else if (hasLog) {
                cellClass += ' bg-green-200 dark:bg-green-800/50 text-light-text-primary dark:text-dark-text-primary print:bg-gray-100';
                cellClass += isSelectionMode ? ' hover:bg-green-300 dark:hover:bg-green-700' : ' hover:bg-green-100 dark:hover:bg-green-900/50';
            } else {
                cellClass += ' bg-gray-50 dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-gray-700 text-light-text-secondary dark:text-dark-text-secondary';
            }
            

            days.push(
                <div key={day} className={cellClass} onClick={() => handleDateClick(date)}>
                    <div className="font-bold text-lg">{day}</div>
                    <div className="flex-grow mt-2 flex items-end">
                         {hasLog && !isSelected && <CheckIcon className="h-5 w-5 text-green-600 dark:text-green-400 absolute bottom-2 right-2" />}
                         {isSelected && <span className="text-xs font-semibold bg-white/30 px-2 py-1 rounded-full mt-1 inline-block print:bg-transparent print:text-black print:border print:border-gray-400">Selecionado</span>}
                    </div>
                </div>
            );
        }
        const totalCells = days.length;
        const cellsToFill = (7 - (totalCells % 7)) % 7;
        for (let i = 0; i < cellsToFill; i++) {
            days.push(<div key={`empty-end-${i}`} className="border-r border-b border-gray-200 dark:border-dark-border"></div>);
        }
        return days;
    };
    
    const renderMonthsGrid = () => {
        const months = Array.from({ length: 12 }, (_, i) => new Date(currentDate.getFullYear(), i).toLocaleString('pt-BR', { month: 'short' }));
        return (
             <div className="grid grid-cols-4 gap-2 p-4">
                {months.map((month, index) => (
                    <button
                        key={month}
                        onClick={() => {
                            setCurrentDate(new Date(currentDate.getFullYear(), index));
                            setPickerView('days');
                        }}
                        className="p-4 rounded-xl text-center font-semibold text-gray-700 dark:text-dark-text-secondary hover:bg-brand-indigo hover:text-white transition"
                    >
                        {month.replace('.', '')}
                    </button>
                ))}
            </div>
        )
    };
    
    const renderYearsGrid = () => {
        const years = Array.from({ length: 12 }, (_, i) => startYearOfDecade + i - 1);
        return (
             <div className="grid grid-cols-4 gap-2 p-4">
                {years.map(year => (
                    <button
                        key={year}
                        onClick={() => {
                            setCurrentDate(new Date(year, currentDate.getMonth()));
                            setPickerView('months');
                        }}
                         className={`p-4 rounded-xl text-center font-semibold text-gray-700 dark:text-dark-text-secondary hover:bg-brand-indigo hover:text-white transition ${year < startYearOfDecade || year > startYearOfDecade + 9 ? 'text-gray-400' : ''}`}
                    >
                        {year}
                    </button>
                ))}
            </div>
        )
    };

    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                {renderHeader()}
                <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                     <button 
                        onClick={toggleSelectionMode}
                        className={`flex items-center gap-2 font-bold py-2 px-4 rounded-xl transition text-sm print:hidden ${isSelectionMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-brand-indigo hover:bg-indigo-700 text-white'}`}
                    >
                         <PrinterIcon className="h-5 w-5" />
                         {isSelectionMode ? 'Cancelar Seleção' : 'Imprimir em Massa'}
                    </button>
                    {isSelectionMode && (
                        <button
                            onClick={handlePrintSelectedClick}
                            disabled={selectedDates.size === 0}
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition text-sm disabled:bg-gray-400 disabled:cursor-not-allowed print:hidden"
                        >
                            Imprimir ({selectedDates.size})
                        </button>
                    )}
                </div>
            </div>

            {isSelectionMode && (
                 <div className="bg-blue-100 dark:bg-blue-900/50 border-l-4 border-blue-500 text-blue-700 dark:text-blue-300 p-4 rounded-md mb-4 print:hidden">
                    <p className="font-bold">Modo de Seleção Ativado</p>
                    <p>Clique nos dias com relatórios preenchidos (em verde) que deseja imprimir. Quando terminar, clique no botão "Imprimir ({selectedDates.size})".</p>
                </div>
            )}
            
            {pickerView === 'days' && (
                <div className="grid grid-cols-7 border-t border-l border-gray-200 dark:border-dark-border">
                    {weekdays.map(day => (
                        <div key={day} className="text-center font-semibold p-2 border-r border-b border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-dark-text-secondary">{day}</div>
                    ))}
                    {renderDaysGrid()}
                </div>
            )}
            {pickerView === 'months' && renderMonthsGrid()}
            {pickerView === 'years' && renderYearsGrid()}
        </div>
    );
};