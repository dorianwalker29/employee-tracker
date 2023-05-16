const mysql = require("mysql2");
require("dotenv").config();
require("console.table");
const enquirer = require("enquirer");
const prompts = require("prompts");

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: " + err);
    return;
  }
  console.log("Connected to the employee_tracker database.");
  promptUser();
});

async function promptUser() {
  const answer = await prompts({
      type: "select",
      name: "options",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        "Update an employee manager",
        "View budget by department",
        "Exit",
      ],
    });
  const { options } = answer;
  if (options === "View all departments") {
    viewDepartments();
  } else if (options === "View all roles") {
    viewRoles();
  } else if (options === "View all employees") {
    viewEmployees();
  } else if (options === "Add a department") {
    addDepartment();
  } else if (options === "Add a role") {
    addRole();
  } else if (options === "Add an employee") {
    addEmployee();
  } else if (options === "Update an employee role") {
    updateEmployeeRole();
  } else if (options === "Update an employee manager") {
    updateEmployeeManager();
  } else if (options === "View budget by department") {
    viewBudget();
  } else if (options === "Exit") {
    db.end();
  }
}

function viewDepartments() {
  db.query("SELECT * FROM department", (err, results) => {
    if (err) {
      console.error("Error viewing departments: " + err);
    } else {
      console.table(results);
    }
    promptUser();
  });
}

function viewRoles() {
  db.query(
    `SELECT role.id, role.title, department.name AS department
     FROM role
     INNER JOIN department ON role.department_id = department.id`,
    (err, results) => {
      if (err) {
        console.error("Error viewing roles: " + err);
      } else {
        console.table(results);
      }
      promptUser();
    }
  );
}

function viewEmployees() {
  db.query(
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager
     FROM employee
     LEFT JOIN role ON employee.role_id = role.id
     LEFT JOIN department ON role.department_id = department.id
     LEFT JOIN employee manager ON employee.manager_id = manager.id`,
    (err, results) => {
      if (err) {
        console.error("Error viewing employees: " + err);
      } else {
        console.table(results);
      }
      promptUser();
    }
  );
}

function addDepartment() {
    inquirer
      .prompt({
        type: "input",
        name: "department",
        message: "Please enter a name for the new department",
      })
      .then((answer) => {
        const { department } = answer;
        const sql = "INSERT INTO department (name) VALUES (?)";
        const params = [department];
  
        db.query(sql, params, (err, _) => {
          if (err) {
            console.error("Error adding department: " + err);
          } else {
            console.log("Department added successfully.");
          }
          promptUser();
        });
      });
  }
  
  function addRole() {
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "Please enter a title for the new role",
        },
        {
          type: "input",
          name: "salary",
          message: "Please enter a salary for the new role",
        },
        {
          type: "input",
          name: "department_id",
          message: "Please enter a department ID for the new role",
        },
      ])
      .then((answer) => {
        const { title, salary, department_id } = answer;
        const sql = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
        const params = [title, salary, department_id];
  
        db.query(sql, params, (err, _) => {
          if (err) {
            console.error("Error adding role: " + err);
          } else {
            console.log("Role added successfully.");
          }
          promptUser();
        });
      });
  }
  
  function addEmployee() {
    inquirer
      .prompt([
        {
          type: "input",
          name: "first_name",
          message: "Please enter the first name for the new employee",
        },
        {
          type: "input",
          name: "last_name",
          message: "Please enter the last name for the new employee",
        },
        {
          type: "input",
          name: "role_id",
          message: "Please enter the role ID for the new employee",
        },
        {
          type: "input",
          name: "manager_id",
          message: "Please enter the manager ID for the new employee",
        },
      ])
      .then((answer) => {
        const { first_name, last_name, role_id, manager_id } = answer;
        const sql =
          "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
        const params = [first_name, last_name, role_id, manager_id];
  
        db.query(sql, params, (err, _) => {
          if (err) {
            console.error("Error adding employee: " + err);
          } else {
            console.log("Employee added successfully.");
          }
          promptUser();
        });
      });
  }
  
  function updateEmployeeRole() {
    inquirer
      .prompt([
        {
          type: "input",
          name: "employee_id",
          message: "Please enter the employee ID to update",
        },
        {
          type: "input",
          name: "role_id",
          message: "Please enter the new role ID for the employee",
        },
      ])
      .then((answer) => {
        const { employee_id, role_id } = answer;
        const sql = "UPDATE employee SET role_id = ? WHERE id = ?";
        const params = [role_id, employee_id];
  
        db.query(sql, params, (err, _) => {
        if (err) {
          console.error("Error updating employee role: " + err);
        } else {
          console.log("Employee role updated successfully.");
        }
        promptUser();
      });
    });
}

function updateEmployeeManager() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "employee_id",
        message: "Please enter the employee ID to update",
      },
      {
        type: "input",
        name: "manager_id",
        message: "Please enter the new manager ID for the employee",
      },
    ])
    .then((answer) => {
      const { employee_id, manager_id } = answer;
      const sql = "UPDATE employee SET manager_id = ? WHERE id = ?";
      const params = [manager_id, employee_id];

      db.query(sql, params, (err, _) => {
        if (err) {
          console.error("Error updating employee manager: " + err);
        } else {
          console.log("Employee manager updated successfully.");
        }
        promptUser();
      });
    });
}

function viewBudget() {
  db.query(
    `SELECT department.name AS department, SUM(role.salary) AS budget
     FROM employee
     LEFT JOIN role ON employee.role_id = role.id
     LEFT JOIN department ON role.department_id = department.id
     GROUP BY department.name`,
    (err, results) => {
      if (err) {
        console.error("Error viewing budget by department: " + err);
      } else {
        console.table(results);
      }
      promptUser();
    }
  );
}
