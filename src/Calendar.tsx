import { useMemo } from "react";
import useCalendar from "./useCalendar";
import { AnimatePresence, motion } from "motion/react";

const Calendar: React.FC<{locale?: string}> = ({
    locale = navigator.language
}) => {
    const {year, month, weekdays, cells, isToday, startOfMonth, goNext, goPrev} = useCalendar(new Date(), locale);

    const monthFormatter = useMemo(() => {
        return new Intl.DateTimeFormat(locale, {month: 'long', year: 'numeric'})
    }, [locale])

    return <>
        <div className="w-full min-w-[200px] p-4">
            <div className="flex items-center justify-between mb-3">
                <button
                    className="px-3 py-2 rounded-2xl border border-gray-50 text-sm hover:bg-gray-100 transition"
                    onClick={goPrev}
                >
                    ← Prev
                </button>

                <div className="text-lg font-semibold select-none">
                    {monthFormatter.format(new Date(year, month, 1))}
                </div>

                <button
                    className="px-3 py-2 rounded-2xl border border-gray-50 text-sm hover:bg-gray-100 transition"
                    onClick={goNext}
                >
                    Next →
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
                {weekdays.map(dayName => (
                    <div key={dayName} className="text-center font-medium py-1">
                        {dayName}
                    </div>
                ))}
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${startOfMonth.getFullYear()}-${startOfMonth.getMonth()}`}
                        initial={{opacity: 0, y: 8}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -8}}
                        transition={{ duration: 0.15}}
                        className="grid grid-cols-7 gap-1"
                    >
                        {cells.map(({date, currentMonth}) => {
                            const todayCell = isToday(date);
                            let base = 'aspect-square relative flex items-center justify-center rounded-2xl select-none';
                            base += todayCell ? '' : 'hover:bg-gray-100';
                            const tones = currentMonth ? 'bg-white' : 'bg-gray-100 opacity-70'
                            const todayRing = todayCell ? 'ring-2 ring-offset-1 ring-blue-400' : '';

                            return <div 
                                key={date.toISOString()}
                                className={`${base} ${tones} ${todayRing}`}
                                title={date.toDateString()}
                                >
                                    <span className={todayCell ? 'font-bold' : ''}>
                                        {date.getDate()}
                                    </span>

                                    {todayCell && (
                                        <span className="absolute -top-1.5 right-1.5 text-[10px] px-1 py-0.5 rounded-md bg-blue-400/80 text-white">
                                            today
                                        </span>
                                    )}
                            </div>
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    </>
}

export default Calendar;