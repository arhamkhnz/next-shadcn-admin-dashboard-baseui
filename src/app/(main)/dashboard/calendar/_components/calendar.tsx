"use client";

import * as React from "react";

import { useCalendarController } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import multiMonthPlugin from "@fullcalendar/react/multimonth";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { differenceInCalendarDays, endOfMonth, format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, XIcon } from "lucide-react";

import { EventCalendarViews } from "@/components/calendar/event-calendar-views";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { demoEvents } from "./events-data";

const views = [
  { value: "dayGridMonth", label: "Month" },
  { value: "timeGridWeek", label: "Week" },
  { value: "timeGridDay", label: "Day" },
];

const calendars = [
  { value: "all", label: "All calendars" },
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "team", label: "Team" },
  { value: "focus", label: "Focus time" },
];

const plugins = [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin];

export function Calendar() {
  const controller = useCalendarController();
  const [eventCount, setEventCount] = React.useState(0);
  const [selectedCalendar, setSelectedCalendar] = React.useState(calendars[0].value);
  const [dateInfo, setDateInfo] = React.useState(() => {
    const now = new Date();

    return {
      title: format(now, "MMMM yyyy"),
      days: differenceInCalendarDays(endOfMonth(now), startOfMonth(now)) + 1,
    };
  });
  const title = dateInfo.title;
  const days = dateInfo.days;

  return (
    <div className="flex flex-col overflow-hidden rounded-md border">
      <div className="bg-sidebar text-sidebar-foreground flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 shrink-0 flex-col gap-1">
          <div className="text-lg leading-none font-medium">{title}</div>
          <p className="text-muted-foreground text-sm">
            {days} days - {eventCount} events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedCalendar}
            onValueChange={(value) => {
              if (value !== null) setSelectedCalendar(value);
            }}
            items={calendars}
          >
            <SelectTrigger className="w-full sm:w-44">
              <CalendarIcon />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectGroup>
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.value} value={calendar.value}>
                    {calendar.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <ButtonGroup>
            <Button size="icon" variant="outline" onClick={() => controller.prev()}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" onClick={() => controller.today()}>
              Today
            </Button>
            <Button size="icon" variant="outline" onClick={() => controller.next()}>
              <ChevronRight />
            </Button>
          </ButtonGroup>
          <Select
            value={controller.view?.type ?? views[0].value}
            onValueChange={(value) => {
              if (value !== null) controller.changeView(value);
            }}
            items={views}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start" alignItemWithTrigger={false}>
              <SelectGroup>
                {views.map((v) => (
                  <SelectItem key={v.value} value={v.value}>
                    {v.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button>
            <Plus />
            Add event
          </Button>
        </div>
      </div>

      <EventCalendarViews
        controller={controller}
        initialView={views[0].value}
        plugins={[...plugins]}
        popoverCloseContent={() => <XIcon className="text-muted-foreground group-hover:text-foreground size-5" />}
        events={demoEvents}
        nowIndicator
        datesSet={(info) => {
          setDateInfo({
            title: info.view.title,
            days: differenceInCalendarDays(info.view.currentEnd, info.view.currentStart),
          });
          setEventCount(
            demoEvents.filter((event) => {
              const start = new Date(event.start);

              return start >= info.start && start < info.end;
            }).length,
          );
        }}
      />
    </div>
  );
}
