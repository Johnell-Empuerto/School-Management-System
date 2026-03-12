import { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../assets/styles/Calendar.css";
import { Helmet } from "react-helmet-async";

// React Icons for Calendar
import {
  FaCalendarAlt,
  FaCalendarWeek,
  FaCalendarDay,
  FaPlusCircle,
  FaSun,
  FaUmbrellaBeach,
  FaExclamationTriangle,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
} from "react-icons/fa";

const localizer = momentLocalizer(moment);

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month"); // month, week, day
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [formData, setFormData] = useState({
    date: "",
    type: "holiday",
    description: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectEvent = (event) => {
    setEditingEvent(event);

    setFormData({
      date: moment(event.start).format("YYYY-MM-DD"),
      type: event.type,
      description: event.title.replace(`${event.type.toUpperCase()} - `, ""),
    });

    setShowForm(true);
  };

  const fetchEvents = async () => {
    const res = await axios.get("http://localhost:3001/api/calendar", {
      withCredentials: true,
    });

    const formatted = res.data.map((e) => {
      const date = new Date(e.date);

      return {
        id: e.id,
        title: `${e.type.toUpperCase()} - ${e.description}`,
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(23, 59, 59, 999)),
        allDay: true,
        type: e.type,
      };
    });

    setEvents(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingEvent) {
      // UPDATE EVENT
      await axios.put(
        `http://localhost:3001/api/calendar/${editingEvent.id}`,
        formData,
        { withCredentials: true },
      );
    } else {
      // CREATE EVENT
      await axios.post("http://localhost:3001/api/calendar", formData, {
        withCredentials: true,
      });
    }

    setEditingEvent(null);
    setFormData({ date: "", type: "holiday", description: "" });
    setShowForm(false);

    fetchEvents();
  };

  // Move handleDelete to the main component level
  const handleDelete = async () => {
    if (!editingEvent) return;

    if (!window.confirm("Delete this event?")) return;

    await axios.delete(
      `http://localhost:3001/api/calendar/${editingEvent.id}`,
      { withCredentials: true },
    );

    setEditingEvent(null);
    setFormData({ date: "", type: "holiday", description: "" });
    setShowForm(false);

    fetchEvents();
  };

  const getEventStyle = (event) => {
    let backgroundColor = "";

    switch (event.type) {
      case "holiday":
        backgroundColor = "#e74c3c";
        break;
      case "class":
        backgroundColor = "#2ecc71";
        break;
      case "event":
        backgroundColor = "#f39c12";
        break;
      case "suspension":
        backgroundColor = "#95a5a6";
        break;
      default:
        backgroundColor = "#3498db";
    }

    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "6px",
        padding: "4px",
        fontSize: "12px",
        display: "block",
      },
    };
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "holiday":
        return <FaUmbrellaBeach />;
      case "class":
        return <FaSun />;
      case "event":
        return <FaStar />;
      case "suspension":
        return <FaExclamationTriangle />;
      default:
        return <FaCalendarAlt />;
    }
  };

  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate("PREV");
    };

    const goToNext = () => {
      toolbar.onNavigate("NEXT");
    };

    const goToToday = () => {
      toolbar.onNavigate("TODAY");
    };

    // Remove handleDelete from here - it's now at the component level

    return (
      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={goToBack}>
            <FaChevronLeft />
          </button>
          <button className="toolbar-btn" onClick={goToToday}>
            Today
          </button>
          <button className="toolbar-btn" onClick={goToNext}>
            <FaChevronRight />
          </button>
          <span className="toolbar-label">{toolbar.label}</span>
        </div>

        <div className="toolbar-center">
          <button
            className={`view-btn ${view === "month" ? "active" : ""}`}
            onClick={() => setView("month")}
          >
            <FaCalendarAlt /> Month
          </button>
          <button
            className={`view-btn ${view === "week" ? "active" : ""}`}
            onClick={() => setView("week")}
          >
            <FaCalendarWeek /> Week
          </button>
          <button
            className={`view-btn ${view === "day" ? "active" : ""}`}
            onClick={() => setView("day")}
          >
            <FaCalendarDay /> Day
          </button>
        </div>

        <div className="toolbar-right">
          <button className="refresh-btn" onClick={fetchEvents}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>
    );
  };

  const EventComponent = ({ event }) => {
    return (
      <span>
        {getEventIcon(event.type)} {event.title}
      </span>
    );
  };

  return (
    <>
      <Helmet>
        <title>Calendar | School Management System</title>
      </Helmet>

      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-header-title">
            <h1>
              <FaCalendarAlt className="header-icon" /> School Calendar
            </h1>
            <p>Manage and track school events, holidays, and class schedules</p>{" "}
            {/* Add this line */}
          </div>
          <button
            className="add-event-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <FaPlusCircle /> {showForm ? "Hide Form" : "Add Event"}
          </button>
        </div>

        {showForm && (
          <div className="calendar-form-container">
            <h3>Add New Event</h3>
            <form className="calendar-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Event Type:</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="class">📚 Class Day</option>
                  <option value="holiday">🏖️ Holiday</option>
                  <option value="event">⭐ Event</option>
                  <option value="suspension">⚠️ Suspension</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  placeholder="Enter description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  <FaPlusCircle /> Add to Calendar
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                {editingEvent && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={handleDelete} // Now this works
                  >
                    Delete Event
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Legend */}
        <div className="calendar-legend">
          <span className="legend-item">
            <span className="legend-color class-day"></span> Class Day
          </span>
          <span className="legend-item">
            <span className="legend-color holiday"></span> Holiday
          </span>
          <span className="legend-item">
            <span className="legend-color event"></span> Event
          </span>
          <span className="legend-item">
            <span className="legend-color suspension"></span> Suspension
          </span>
        </div>

        <div className="calendar-wrapper">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent,
            }}
            eventPropGetter={getEventStyle}
            popup
            selectable
          />
        </div>
      </div>
    </>
  );
}

export default CalendarPage;
