
export const createEventRenderer = () => {
  return (arg: any) => {
    const isMonthView = arg.view.type === 'dayGridMonth';
    
    if (isMonthView) {
      return {
        html: `<div style="
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        ">${arg.event.title}</div>`
      };
    } else {
      return {
        html: `<div style="
          display: -webkit-box;
          -webkit-line-clamp: 3;  /* Máximo 3 líneas */
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          white-space: normal;
        ">${arg.event.title}</div>`
      };
    }
  };
};
