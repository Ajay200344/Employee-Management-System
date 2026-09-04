const API_URL = "http://localhost:8081";


/* =========================
REFRESH ACCESS TOKEN
========================= */

async function refreshAccessToken() {

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        return false;
    }

    try {

        const response = await fetch(
            `${API_URL}/refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
            {
                method: "POST"
            }
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        // Backend returns a new access token
        // and the same refresh token
        localStorage.setItem("accessToken", data.accessToken);

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }
}


/* =========================
FETCH WITH REFRESH
========================= */

async function fetchWithRefresh(url, options = {}) {

    let accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "login.html";

        return null;
    }


    /* =========================
    ADD ACCESS TOKEN
    ========================= */

    options.headers = {
        ...options.headers,
        "Authorization": `Bearer ${accessToken}`
    };


    /* =========================
    ORIGINAL REQUEST
    ========================= */

    let response = await fetch(url, options);


    /* =========================
    ACCESS TOKEN EXPIRED
    ========================= */

    if (response.status === 401) {

        const refreshed = await refreshAccessToken();


        /* =========================
        REFRESH TOKEN EXPIRED
        ========================= */

        if (!refreshed) {

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            window.location.href = "login.html";

            return null;
        }


        /* =========================
        GET NEW ACCESS TOKEN
        ========================= */

        accessToken = localStorage.getItem("accessToken");


        /* =========================
        UPDATE AUTHORIZATION HEADER
        ========================= */

        options.headers = {
            ...options.headers,
            "Authorization": `Bearer ${accessToken}`
        };


        /* =========================
        CALL PREVIOUS REQUEST AGAIN
        ========================= */

        response = await fetch(url, options);

    }


    return response;

}


/* =========================
LOGIN
========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;


        try {

            const response = await fetch(`${API_URL}/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })

            });


            if (!response.ok) {

                throw new Error(
                    "Invalid username or password"
                );

            }


            const data = await response.json();


            localStorage.setItem(
                "accessToken",
                data.accessToken
            );

            localStorage.setItem(
                "refreshToken",
                data.refreshToken
            );


            window.location.href = "dashboard.html";


        } catch (error) {

            alert(error.message);

        }

    });

}


/* =========================
REGISTER
========================= */

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const username =
                document.getElementById("username").value;

            const password =
                document.getElementById("password").value;


            try {

                const response = await fetch(
                    `${API_URL}/register`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })

                    }
                );


                if (!response.ok) {

                    throw new Error(
                        "Registration failed"
                    );

                }


                alert("Registration successful");

                window.location.href = "login.html";


            } catch (error) {

                alert(error.message);

            }

        }
    );

}


/* =========================
LOGOUT
========================= */

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();

            const refreshToken =
                localStorage.getItem("refreshToken");


            try {

                await fetch(
                    `${API_URL}/logout?refreshToken=${encodeURIComponent(refreshToken)}`,
                    {
                        method: "POST"
                    }
                );

            } catch (error) {

                console.error(error);

            }


            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");

            window.location.href = "login.html";

        }
    );

}


/* =========================
GET ALL EMPLOYEES
========================= */

const employeeTableBody =
    document.getElementById("employeeTableBody");

if (employeeTableBody) {

    const accessToken =
        localStorage.getItem("accessToken");


    if (!accessToken) {

        window.location.href = "login.html";

    } else {

        fetchWithRefresh(
            `${API_URL}/employees`,
            {
                method: "GET"
            }
        )

        .then(response => {

            if (!response) {
                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "You are not authorized to access employees"
                );

            }


            if (!response.ok) {

                throw new Error(
                    "Failed to fetch employees"
                );

            }


            return response.json();

        })

        .then(employees => {

            if (!employees) {
                return;
            }


            employeeTableBody.innerHTML = "";


            employees.forEach(employee => {

                const row =
                    document.createElement("tr");


                row.innerHTML = `
                    <td>${employee.id}</td>
                    <td>${employee.name}</td>
                    <td>${employee.email}</td>
                    <td>${employee.department}</td>
                    <td>${employee.salary}</td>
                    <td>

                        <button
                            onclick="editEmployee(${employee.id})">
                            Edit
                        </button>

                        <button
                            onclick="deleteEmployee(${employee.id})">
                            Delete
                        </button>

                    </td>
                `;


                employeeTableBody.appendChild(row);

            });

        })

        .catch(error => {

            console.error(error);

            alert(error.message);

        });

    }

}


/* =========================
ADD EMPLOYEE
========================= */

const addEmployeeForm =
    document.getElementById("addEmployeeForm");

if (addEmployeeForm) {

    addEmployeeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document.getElementById("name").value;

            const email =
                document.getElementById("email").value;

            const department =
                document.getElementById("department").value;

            const salary =
                document.getElementById("salary").value;


            try {

                const response =
                    await fetchWithRefresh(
                        `${API_URL}/employees`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,
                                email: email,
                                department: department,
                                salary: salary

                            })

                        }
                    );


                if (!response) {
                    return;
                }


                if (response.status === 403) {

                    throw new Error(
                        "You are not authorized to add an employee"
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        "Failed to add employee"
                    );

                }


                alert(
                    "Employee added successfully"
                );


                window.location.href =
                    "employees.html";


            } catch (error) {

                console.error(error);

                alert(error.message);

            }

        }
    );

}


/* =========================
EDIT EMPLOYEE
========================= */

function editEmployee(id) {

    window.location.href =
        `edit-employee.html?id=${id}`;

}


/* =========================
LOAD EMPLOYEE FOR EDIT
========================= */

const editEmployeeForm =
    document.getElementById("editEmployeeForm");

if (editEmployeeForm) {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const employeeId =
        params.get("id");


    fetchWithRefresh(
        `${API_URL}/employees/${employeeId}`,
        {
            method: "GET"
        }
    )

    .then(response => {

        if (!response) {
            return;
        }


        if (response.status === 403) {

            throw new Error(
                "You are not authorized to load this employee"
            );

        }


        if (!response.ok) {

            throw new Error(
                "Failed to load employee"
            );

        }


        return response.json();

    })

    .then(employee => {

        if (!employee) {
            return;
        }


        document.getElementById(
            "employeeId"
        ).value = employee.id;


        document.getElementById(
            "name"
        ).value = employee.name;


        document.getElementById(
            "email"
        ).value = employee.email;


        document.getElementById(
            "department"
        ).value = employee.department;


        document.getElementById(
            "salary"
        ).value = employee.salary;

    })

    .catch(error => {

        console.error(error);

        alert(error.message);

    });


    /* =========================
    UPDATE EMPLOYEE
    ========================= */

    editEmployeeForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "employeeId"
                ).value;


            const name =
                document.getElementById("name").value;

            const email =
                document.getElementById("email").value;

            const department =
                document.getElementById(
                    "department"
                ).value;

            const salary =
                document.getElementById(
                    "salary"
                ).value;


            try {

                const response =
                    await fetchWithRefresh(
                        `${API_URL}/employees/${id}`,
                        {

                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,
                                email: email,
                                department: department,
                                salary: salary

                            })

                        }
                    );


                if (!response) {
                    return;
                }


                if (response.status === 403) {

                    throw new Error(
                        "You are not authorized to update this employee"
                    );

                }


                if (!response.ok) {

                    throw new Error(
                        "Failed to update employee"
                    );

                }


                alert(
                    "Employee updated successfully"
                );


                window.location.href =
                    "employees.html";


            } catch (error) {

                console.error(error);

                alert(error.message);

            }

        }
    );

}


/* =========================
DELETE EMPLOYEE
========================= */

window.deleteEmployee =
    async function (id) {


        const confirmDelete =
            confirm(
                "Are you sure you want to delete this employee?"
            );


        if (!confirmDelete) {
            return;
        }


        try {

            const response =
                await fetchWithRefresh(
                    `${API_URL}/employees/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            if (!response) {
                return;
            }


            if (response.status === 403) {

                throw new Error(
                    "You are not authorized to delete this employee"
                );

            }


            if (!response.ok) {

                throw new Error(
                    "Failed to delete employee"
                );

            }


            alert(
                "Employee deleted successfully"
            );


            window.location.reload();


        } catch (error) {

            console.error(error);

            alert(error.message);

        }

    };