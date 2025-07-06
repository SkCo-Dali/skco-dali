
import React from 'react';

export const CalendarStyles: React.FC = () => (
  <>
    <style>
      {`
        /* Eventos vista mensual */
        .fc-daygrid-event {
          font-size: 11px !important;
          line-height: 1.2 !important;
          padding: 1px 2px !important;
          white-space: normal !important;
          overflow-wrap: break-word !important;
          text-overflow: ellipsis !important;
          overflow: hidden !important;
        }
        .fc-daygrid-event-dot {
          display: none !important;
        }

        /* Eventos vista semanal y diaria */
        .fc-timegrid-event {
          height: auto !important;
          min-height: 24px !important;
          padding: 2px 4px !important;
          overflow: hidden !important;
          white-space: normal !important;
          word-break: break-word !important;
        }

        .fc-timegrid-event  {
          white-space: normal !important;
          overflow-wrap: break-word !important;
          text-overflow: ellipsis !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 4 !important; /* limitar a 4 líneas */
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          height: auto !important;
        }

        .fc-event-title {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          max-width: 100% !important;
          display: block;
        }
      `}
    </style>

    <style>
      {`
        .fc-button {
          background-color: #00c83c !important;
          color: white !important;
          border: none !important;
          border-radius: 9999px !important;
          padding: 6px 12px !important;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }

        .fc-button:hover {
          background-color: #00a632 !important;
          color: white !important;
        }

        .fc-button:focus {
          outline: 2px solid #008c2c !important;
          outline-offset: 2px;
        }

        .fc-button-active {
          background-color: #008c2c !important;
          color: white !important;
        }

        .fc-button-group {
          gap: 8px;
        }
      `}
    </style>
  </>
);
