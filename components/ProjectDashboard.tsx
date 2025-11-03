import React, { useState } from 'react';
import { Project, User, Constructor, PlatformSettings } from '../types';
import { DailyLog } from './DailyLog';
import { CalendarView } from './CalendarView';
import { ArrowLeftIcon } from './icons';
import { BulkPrintView } from './BulkPrintView';

interface ProjectDashboardProps {
    project: Project;
    currentUser: User;
    constructors: Constructor[];
    platformSettings: PlatformSettings;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ project, currentUser, constructors, platformSettings }) => {
    const [view, setView] = useState<'calendar' | 'log' | 'bulkPrint'>('calendar');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [datesToPrint, setDatesToPrint] = useState<string[]>([]);


    const handleSelectDate = (date: string) => {
        setSelectedDate(date);
        setView('log');
    };
    
    const handleNextDay = () => {
        if (selectedDate) {
            const currentDate = new Date(selectedDate + 'T00:00:00');
            currentDate.setDate(currentDate.getDate() + 1);
            setSelectedDate(currentDate.toISOString().split('T')[0]);
        }
    };
    
    const handlePrevDay = () => {
        if (selectedDate) {
            const currentDate = new Date(selectedDate + 'T00:00:00');
            currentDate.setDate(currentDate.getDate() - 1);
            setSelectedDate(currentDate.toISOString().split('T')[0]);
        }
    };

    const handlePrintSelected = (dates: string[]) => {
        setDatesToPrint(dates);
        setView('bulkPrint');
    };

    const handleBackToCalendar = () => {
        setView('calendar');
        setSelectedDate(null);
        setDatesToPrint([]);
    };

    const BackToCalendarButton = () => (
        <button 
            onClick={handleBackToCalendar} 
            className="flex items-center gap-2 mb-4 text-brand-blue font-semibold hover:underline print:hidden"
        >
            <ArrowLeftIcon className="h-5 w-5" />
            Voltar para o Calendário
        </button>
    );

    if (view === 'calendar') {
        return <CalendarView 
                    project={project} 
                    onSelectDate={handleSelectDate} 
                    onPrintSelected={handlePrintSelected}
                />;
    }

    if (view === 'bulkPrint') {
        return (
            <div>
                <BackToCalendarButton />
                <BulkPrintView
                    project={project}
                    dates={datesToPrint}
                    constructors={constructors}
                    platformSettings={platformSettings}
                />
            </div>
        );
    }

    if (view === 'log' && selectedDate) {
        return (
             <DailyLog 
                key={selectedDate}
                project={project} 
                date={selectedDate} 
                currentUser={currentUser} 
                constructors={constructors} 
                onBackToCalendar={handleBackToCalendar}
                onNextDay={handleNextDay}
                onPrevDay={handlePrevDay}
                platformSettings={platformSettings}
            />
        );
    }
    
    return null;
};