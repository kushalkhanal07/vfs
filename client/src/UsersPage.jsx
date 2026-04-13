import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./components/DirectoryHeader";
import "./UsersPage.css";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("Guest User");
  const [userRole, setUserRole] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`${BASE_URL}/users`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else if (response.status === 403) {
          navigate("/");
        } else if (response.status === 401) {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching users data", err);
      }
    }

    async function fetchUser() {
      try {
        const response = await fetch(`${BASE_URL}/user`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name);
          setUserRole(data.role);
        } else if (response.status === 401) {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    }

    fetchUsers();
    fetchUser();
  }, [navigate]);

  const logoutUser = (userId) => {
    alert(`Logging out user with ID: ${userId}`);
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isLoggedIn: false } : user
      )
    );
  };

  return (
    <div className="users-container">
      <h1 className="title">All Users</h1>
      <p>
        {userName}: {userRole}
      </p>
      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th></th>
            {userRole === "Admin" && <th></th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.isLoggedIn ? "Logged In" : "Logged Out"}</td>
              <td>
                <button
                  className="logout-button"
                  onClick={() => logoutUser(user.id)}
                  disabled={!user.isLoggedIn}
                >
                  Logout
                </button>
              </td>

              {userRole === "Admin" && (
                <td>
                  <button
                    className="logout-button delete-button"
                    onClick={() => console.log(user.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

