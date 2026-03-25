import { useCallback, useMemo, useState } from "react";

// Extend Intl.Locale to include weekInfo
type LocaleWithWeekInfo = Intl.Locale & {
    weekInfo?: {
        firstDay: number;
    };
};

function detectLocaleFirstDay(locale: string) {
    try {
        const loc = new Intl.Locale(locale) as LocaleWithWeekInfo;

        if (loc.weekInfo?.firstDay !== undefined) {
            return loc.weekInfo.firstDay % 7;
        }
    } catch (error) {
        console.error("Locale detection failed:", error);
    }

    return 0; // fallback (Sunday)
}

function useCalendar(date: Date, locale: string) {
    const [startOfMonth, setStartOfMonth] = useState(
        new Date(date.getFullYear(), date.getMonth(), 1)
    );

    const goNext = useCallback(() => {
        setStartOfMonth((d: Date) =>
            new Date(d.getFullYear(), d.getMonth() + 1, 1)
        );
    }, []);

    const goPrev = useCallback(() => {
        setStartOfMonth((d: Date) =>
            new Date(d.getFullYear(), d.getMonth() - 1, 1)
        );
    }, []);

    const data = useMemo(() => {
        const now = new Date();
        const year = startOfMonth.getFullYear();
        const month = startOfMonth.getMonth();

        const endOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = endOfMonth.getDate();

        // Weekday names
        const weekDayFormatter = new Intl.DateTimeFormat(locale, {
            weekday: "short",
        });

        let weekdays = Array.from({ length: 7 }, (_, i) => {
            const base = new Date(2021, 7, i + 1);
            return weekDayFormatter.format(base);
        });

        const startIndex = detectLocaleFirstDay(locale);

        // Reorder weekdays based on locale
        weekdays = weekdays
            .slice(startIndex)
            .concat(weekdays.slice(0, startIndex));

        // Calculate leading days
        const firstDayIndex = startOfMonth.getDay();
        const leading = (firstDayIndex - startIndex + 7) % 7;

        const cells: { date: Date; currentMonth: boolean }[] = [];

        // Previous month days
        for (let i = leading; i > 0; i--) {
            cells.push({
                date: new Date(year, month, 1 - i),
                currentMonth: false,
            });
        }

        // Current month days
        for (let j = 1; j <= daysInMonth; j++) {
            cells.push({
                date: new Date(year, month, j),
                currentMonth: true,
            });
        }

        // Next month days (fill to 6 weeks = 42 cells)
        while (cells.length < 42) {
            const last = cells[cells.length - 1].date;
            const next = new Date(last);
            next.setDate(last.getDate() + 1);

            cells.push({
                date: next,
                currentMonth: false,
            });
        }

        const isToday = (date: Date) => {
            return (
                date.getFullYear() === now.getFullYear() &&
                date.getMonth() === now.getMonth() &&
                date.getDate() === now.getDate()
            );
        };

        return {
            year,
            month,
            weekdays,
            cells,
            isToday,
        };
    }, [startOfMonth, locale]); 

    return { ...data, startOfMonth, goNext, goPrev };
}

export default useCalendar;