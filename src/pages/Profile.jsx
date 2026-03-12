import { useEffect, useState } from "react";
import axios from "axios";
import "../assets/styles/Profile.css";
import { Helmet } from "react-helmet-async";

function Profile() {
  const API = "http://localhost:3001/api";

  const [profile, setProfile] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({});

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/profile`, {
        withCredentials: true,
      });

      setProfile(res.data);
      setFormData(res.data); // fill edit form
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData({
        ...formData,
        profile_photo: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    try {
      await axios.put(`${API}/profile`, formData, {
        withCredentials: true,
      });

      setShowEditModal(false);
      fetchProfile();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchGrades = async () => {
    try {
      const res = await axios.get(`${API}/profile/grades`, {
        withCredentials: true,
      });
      setGrades(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAttendance = async () => {
    const res = await axios.get(`${API}/profile/attendance`, {
      withCredentials: true,
    });
    setAttendance(res.data);
  };

  useEffect(() => {
    fetchProfile();
    fetchGrades();
    fetchAttendance();
  }, []);

  if (!profile) {
    return <div className="profile-container">Loading profile...</div>;
  }

  const isStudent = profile.role === "student";
  const isTeacher = profile.role === "teacher";

  const totalDays =
    (attendance?.present || 0) +
    (attendance?.absent || 0) +
    (attendance?.late || 0);
  const attendanceRate =
    totalDays > 0
      ? (((attendance?.present || 0) / totalDays) * 100).toFixed(1)
      : 0;

  return (
    <>
      <Helmet>
        <title>Profile | School Management System</title>
      </Helmet>
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-header-actions">
          <button
            className="edit-profile-btn"
            onClick={() => setShowEditModal(true)}
          >
            Edit Profile
          </button>
        </div>

        {/* Profile Header with Avatar */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.profile_photo ? (
              <img src={profile.profile_photo} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {profile.first_name?.charAt(0)}
                {profile.last_name?.charAt(0)}
              </div>
            )}
          </div>

          <div className="profile-info-badge">
            <h3>
              {profile.first_name} {profile.last_name}
              <span>({profile.school_id})</span>
            </h3>
            <p>
              {profile.role?.charAt(0).toUpperCase() + profile.role?.slice(1)}
            </p>
            <div className={`profile-badge-status status-${profile.status}`}>
              {profile.status}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {attendance && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-value">{attendance.present || 0}</div>
              <div className="stat-label">Days Present</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{attendance.absent || 0}</div>
              <div className="stat-label">Days Absent</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{attendance.late || 0}</div>
              <div className="stat-label">Days Late</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{attendanceRate}%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
          </div>
        )}

        {/* Personal Information Card */}
        <div className="profile-card">
          <p>
            <strong>School ID</strong>
            <span>{profile.school_id}</span>
          </p>

          <p>
            <strong>Full Name</strong>
            <span>
              {profile.first_name} {profile.middle_name} {profile.last_name}{" "}
              {profile.suffix_name}
            </span>
          </p>

          <p>
            <strong>Gender</strong>
            <span>{profile.gender || "Not specified"}</span>
          </p>

          <p>
            <strong>Birthdate</strong>
            <span>
              {profile.birthdate
                ? new Date(profile.birthdate).toLocaleDateString()
                : "Not specified"}
            </span>
          </p>

          <p>
            <strong>Age</strong>
            <span>{profile.age || "Not specified"}</span>
          </p>

          <p>
            <strong>Contact Number</strong>
            <span>{profile.contact_number || "Not specified"}</span>
          </p>

          <p>
            <strong>Email</strong>
            <span>{profile.email || "Not specified"}</span>
          </p>

          <p>
            <strong>Address</strong>
            <span>{profile.address || "Not specified"}</span>
          </p>

          {isStudent && (
            <>
              <p>
                <strong>Guardian</strong>
                <span>{profile.guardian_name || "Not specified"}</span>
              </p>

              <p>
                <strong>Guardian Contact</strong>
                <span>{profile.guardian_contact || "Not specified"}</span>
              </p>
            </>
          )}

          {isTeacher && (
            <>
              <p>
                <strong>Department</strong>
                <span>{profile.department || "Not specified"}</span>
              </p>

              <p>
                <strong>Rank Level</strong>
                <span>{profile.rank_level || "Not specified"}</span>
              </p>

              <p>
                <strong>Specialization</strong>
                <span>{profile.specialization || "Not specified"}</span>
              </p>

              <p>
                <strong>Hire Date</strong>
                <span>
                  {profile.hire_date
                    ? new Date(profile.hire_date).toLocaleDateString()
                    : "Not specified"}
                </span>
              </p>

              <p>
                <strong>Employment Type</strong>
                <span>{profile.employment_type || "Not specified"}</span>
              </p>

              <p>
                <strong>Highest Education</strong>
                <span>{profile.highest_education || "Not specified"}</span>
              </p>
            </>
          )}
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowEditModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit Profile</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowEditModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {/* Profile Photo Upload */}
                <div className="edit-section">
                  <label>Profile Photo</label>
                  <div className="photo-upload-section">
                    <div className="edit-avatar">
                      {formData.profile_photo ? (
                        <img src={formData.profile_photo} alt="Profile" />
                      ) : (
                        <div className="avatar-placeholder">
                          {profile.first_name?.charAt(0)}
                          {profile.last_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="edit-section">
                  <h3>Personal Information</h3>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Birthdate</label>
                    <input
                      type="date"
                      name="birthdate"
                      value={
                        formData.birthdate
                          ? formData.birthdate.split("T")[0]
                          : ""
                      }
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number || ""}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                {/* Student Specific Fields */}
                {isStudent && (
                  <div className="edit-section">
                    <h3>Guardian Information</h3>

                    <div className="form-group">
                      <label>Guardian Name</label>
                      <input
                        type="text"
                        name="guardian_name"
                        value={formData.guardian_name || ""}
                        onChange={handleChange}
                        placeholder="Enter guardian name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Guardian Contact</label>
                      <input
                        type="text"
                        name="guardian_contact"
                        value={formData.guardian_contact || ""}
                        onChange={handleChange}
                        placeholder="Enter guardian contact"
                      />
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                )}

                {/* Teacher Specific Fields */}
                {isTeacher && (
                  <div className="edit-section">
                    <h3>Professional Information</h3>

                    <div className="form-group">
                      <label>Department</label>
                      <select
                        name="department"
                        value={formData.department || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Department</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Science">Science</option>
                        <option value="English">English</option>
                        <option value="History">History</option>
                        <option value="Physical Education">
                          Physical Education
                        </option>
                        <option value="Arts">Arts</option>
                        <option value="Computer Science">
                          Computer Science
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Rank Level</label>
                      <select
                        name="rank_level"
                        value={formData.rank_level || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Rank</option>
                        <option value="Teacher I">Teacher I</option>
                        <option value="Teacher II">Teacher II</option>
                        <option value="Teacher III">Teacher III</option>
                        <option value="Master Teacher I">
                          Master Teacher I
                        </option>
                        <option value="Instructor I">Instructor I</option>
                        <option value="Instructor II">Instructor II</option>
                        <option value="Instructor III">Instructor III</option>
                        <option value="Assistant Professor I">
                          Assistant Professor I
                        </option>
                        <option value="Assistant Professor II">
                          Assistant Professor II
                        </option>
                        <option value="Assistant Professor III">
                          Assistant Professor III
                        </option>
                        <option value="Associate Professor I">
                          Associate Professor I
                        </option>
                        <option value="Associate Professor II">
                          Associate Professor II
                        </option>
                        <option value="Associate Professor III">
                          Associate Professor III
                        </option>
                        <option value="Professor I">Professor I</option>
                        <option value="Professor II">Professor II</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization || ""}
                        onChange={handleChange}
                        placeholder="Enter specialization"
                      />
                    </div>

                    <div className="form-group">
                      <label>Hire Date</label>
                      <input
                        type="date"
                        name="hire_date"
                        value={
                          formData.hire_date
                            ? formData.hire_date.split("T")[0]
                            : ""
                        }
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Employment Type</label>
                      <select
                        name="employment_type"
                        value={formData.employment_type || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Type</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Highest Education</label>
                      <select
                        name="highest_education"
                        value={formData.highest_education || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Education</option>
                        <option value="Bachelor's Degree">
                          Bachelor's Degree
                        </option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Doctorate Degree">
                          Doctorate Degree
                        </option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button className="save-btn" onClick={updateProfile}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Profile;
