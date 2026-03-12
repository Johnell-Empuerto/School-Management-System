import { useEffect, useState } from "react";
import api from "../services/api";
import styles from "../assets/styles/Activity.module.css";
import { Helmet } from "react-helmet-async";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  // Search, Sort, Pagination states
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("activity_date");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    activity_date: "",
    type: "activity",
  });

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchActivities();
    }, 400);

    return () => clearTimeout(delay);
  }, [search, sort, page]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/activities?search=${search}&sort=${sort}&page=${page}`,
      );

      // If your backend returns pagination metadata
      if (res.data.data) {
        setActivities(res.data.data);
        setTotalPages(res.data.totalPages);
      } else {
        // If backend just returns array
        setActivities(res.data);
        setTotalPages(Math.ceil(res.data.length / 5) || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await api.put(`/activities/${editId}`, formData);
      } else {
        await api.post("/activities", formData);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        activity_date: "",
        type: "activity",
      });
      setEditId(null);
      setShowForm(false);

      // Refresh activities and go to first page
      setPage(1);
      fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  const deleteActivity = async (id) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await api.delete(`/activities/${id}`);

      fetchActivities();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (activity) => {
    setFormData({
      title: activity.title,
      description: activity.description,
      activity_date: activity.activity_date.split("T")[0],
      type: activity.type,
    });

    setEditId(activity.id);
    setShowForm(true);

    // Scroll to form
    setTimeout(() => {
      document
        .querySelector(`.${styles["activity-form-card"]}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 100);
  };

  const cancelEdit = () => {
    setFormData({
      title: "",
      description: "",
      activity_date: "",
      type: "activity",
    });
    setEditId(null);
    setShowForm(false);
  };

  const getTypeIcon = (type) => {
    return type === "activity" ? "📅" : "📢";
  };

  const getTypeColor = (type) => {
    return type === "activity" ? "#4caf50" : "#ff9800";
  };

  if (loading && activities.length === 0) {
    return (
      <div className={styles["activity-container"]}>
        <div className={styles["loading-state"]}>Loading activities...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Activity | School Management System</title>
      </Helmet>
      <div className={styles["activity-container"]}>
        <div className={styles["activity-header"]}>
          <h1>School Activities & Announcements</h1>
          <p>
            Stay updated with the latest events and news from our school
            community
          </p>
        </div>

        {/* Create Post Button - Only for non-students */}
        {user.role !== "student" && !showForm && (
          <div className={styles["activity-header-actions"]}>
            <button
              className={styles["create-post-btn"]}
              onClick={() => setShowForm(true)}
            >
              <span className={styles["btn-icon"]}>+</span>
              Create New Post
            </button>
          </div>
        )}

        {/* FORM CARD - Only for non-students */}
        {user.role !== "student" && showForm && (
          <div className={styles["activity-form-card"]}>
            <div className={styles["form-card-header"]}>
              <h3>
                <span className={styles["header-icon"]}>
                  {editId ? "✏️" : "➕"}
                </span>
                {editId ? "Edit Post" : "Create New Post"}
              </h3>
              <button className={styles["close-form-btn"]} onClick={cancelEdit}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles["activity-form"]}>
              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div className={styles["form-group"]}>
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    style={{ borderColor: getTypeColor(formData.type) }}
                  >
                    <option value="activity">📅 Activity</option>
                    <option value="announcement">📢 Announcement</option>
                  </select>
                </div>
              </div>

              <div className={styles["form-group"]}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Write your post content here..."
                  rows="4"
                  required
                />
              </div>

              <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.activity_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activity_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className={styles["form-actions"]}>
                  <button
                    type="button"
                    className={styles["cancel-btn"]}
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                  <button className={styles["submit-btn"]} type="submit">
                    {editId ? "✏️ Update" : "📤 Post"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className={styles["activity-controls"]}>
          <div className={styles["search-box"]}>
            <span className={styles["search-icon"]}>🔍</span>
            <input
              type="text"
              placeholder="Search activities..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            {search && (
              <button
                className={styles["clear-search"]}
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                ×
              </button>
            )}
          </div>

          <div className={styles["sort-box"]}>
            <span className={styles["sort-icon"]}>⚡</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="activity_date">Sort by: Date</option>
              <option value="title">Sort by: Title</option>
              <option value="type">Sort by: Type</option>
            </select>
          </div>
        </div>

        {/* Activity List */}
        <div className={styles["activity-list"]}>
          {activities.length === 0 ? (
            <div className={styles["empty-state"]}>
              <div className={styles["empty-icon"]}>📭</div>
              <h3>No activities found</h3>
              <p>Check back later for updates or try a different search</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className={styles["activity-item"]}>
                <div
                  className={styles["activity-type-badge"]}
                  style={{
                    background: `linear-gradient(135deg, ${getTypeColor(activity.type)}, ${getTypeColor(activity.type)}dd)`,
                    boxShadow: `0 5px 15px ${getTypeColor(activity.type)}40`,
                  }}
                >
                  {getTypeIcon(activity.type)} {activity.type}
                </div>

                <div className={styles["activity-content"]}>
                  <h3 className={styles["activity-title"]}>{activity.title}</h3>
                  <p className={styles["activity-description"]}>
                    {activity.description}
                  </p>

                  <div className={styles["activity-meta"]}>
                    <span className={styles["activity-date"]}>
                      <span className={styles["meta-icon"]}>📅</span>
                      {formatDate(activity.activity_date)}
                    </span>

                    {activity.school_id && (
                      <span className={styles["activity-author"]}>
                        <span className={styles["meta-icon"]}>👤</span>
                        Posted by: {activity.school_id}
                      </span>
                    )}
                  </div>
                </div>

                {user.role !== "student" && (
                  <div className={styles["activity-actions"]}>
                    <button
                      className={styles["edit-btn"]}
                      onClick={() => openEdit(activity)}
                      data-tooltip="Edit post"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles["delete-btn"]}
                      onClick={() => deleteActivity(activity.id)}
                      data-tooltip="Delete post"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading Skeleton */}
          {loading && activities.length > 0 && (
            <div className={styles["loading-skeleton"]}>
              <div className={styles["skeleton-item"]}></div>
              <div className={styles["skeleton-item"]}></div>
              <div className={styles["skeleton-item"]}></div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {activities.length > 0 && (
          <div className={styles["pagination"]}>
            <button
              className={styles["pagination-btn"]}
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              ← Previous
            </button>

            <div className={styles["page-info"]}>
              <span className={styles["current-page"]}>{page}</span>
              <span className={styles["total-pages"]}>of {totalPages}</span>
            </div>

            <button
              className={styles["pagination-btn"]}
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Activity;
