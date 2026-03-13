import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/styles/Login.module.css";
import { FaUser, FaLock, FaSignInAlt, FaSchool } from "react-icons/fa";
import api from "../services/api";
import { Helmet } from "react-helmet-async";

function Login() {
  const navigate = useNavigate();

  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/login", {
        school_id: schoolId,
        password: password,
      });

      // api.interceptors already handles credentials and headers
      // response.data is already parsed JSON

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        // Show success message
        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        alert(response.data.message || "Login failed");
        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      alert(
        err.response?.data?.message || "Connection error. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | School Management System</title>
      </Helmet>
      <div className={styles.loginContainer}>
        {/* Background Decorative Elements */}
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>
        <div className={styles.bgCircle3}></div>

        <div className={styles.loginWrapper}>
          {/* Left Side - Branding/Illustration */}
          <div className={styles.brandSection}>
            <div className={styles.brandContent}>
              <div className={styles.schoolIcon}>
                <FaSchool />
              </div>
              <h1 className={styles.brandTitle}>SMS</h1>
              <p className={styles.brandSubtitle}>School Management System</p>
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <span className={styles.featureDot}></span>
                  <span>Student Management</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureDot}></span>
                  <span>Attendance Tracking</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureDot}></span>
                  <span>Grade Management</span>
                </div>
                <div className={styles.featureItem}>
                  <span className={styles.featureDot}></span>
                  <span>Reports & Analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2>Welcome Back!</h2>
                <p className={styles.schoolName}>
                  Batu-Batu National Integrated High School
                </p>
              </div>

              <form onSubmit={handleLogin} className={styles.loginForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="schoolId">School ID</label>
                  <div className={styles.inputWrapper}>
                    <FaUser className={styles.inputIcon} />
                    <input
                      id="schoolId"
                      type="text"
                      placeholder="Enter your School ID"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password">Password</label>
                  <div className={styles.inputWrapper}>
                    <FaLock className={styles.inputIcon} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className={styles.formOptions}>
                  <label className={styles.rememberMe}>
                    <input type="checkbox" /> Remember me
                  </label>
                  <a href="#" className={styles.forgotPassword}>
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  className={styles.loginBtn}
                  disabled={loading}
                >
                  {loading ? (
                    <span className={styles.loader}></span>
                  ) : (
                    <>
                      <FaSignInAlt /> Sign In
                    </>
                  )}
                </button>
              </form>

              <div className={styles.formFooter}>
                <p>
                  © {new Date().getFullYear()} School Management System. All
                  rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
