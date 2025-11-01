const { Sequelize, DataTypes } = require("sequelize");

// ========================================
// CONNECT TO Supabase PostgreSQL
// ========================================

const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      protocol: "postgres",
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      pool: {
        max: 5,
        min: 1,
        acquire: 30000,
        idle: 10000
      }
    })
  : new Sequelize(
      process.env.DB_NAME || 'postgres',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        },
        pool: {
          max: 5,
          min: 1,
          acquire: 30000,
          idle: 10000
        }
      }
    );

// ========================================
// DEFINE MODELS (FIXED - Consistent naming)
// ========================================

const Student = sequelize.define("Student", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    field: 'name'
  },
  rollNumber: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    field: 'rollnumber'
  },
  registerNumber: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'registernumber'
  },
  admissionYear: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'admissionyear'
  },
  courseType: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'coursetype'
  },
  course: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'course'
  },
  branch: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'branch'
  },
  academicYear: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'academicyear'
  },
  verification: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'verification'
  },
  class: { 
    type: DataTypes.STRING, 
    allowNull: true,
    field: 'class'
  }
}, {
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'students'
});

const Attendance = sequelize.define("Attendance", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'student_name'
  },
  registerNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'register_number'
  },
  date: { 
    type: DataTypes.DATEONLY, 
    allowNull: false,
    field: 'date'
  },
  status: { 
    type: DataTypes.ENUM('Present', 'Absent'), 
    allowNull: false,
    field: 'status'
  },
  StudentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id'
    },
    field: 'studentid'
  }
}, {
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'attendances'
});

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  staffId: { 
    type: DataTypes.STRING, 
    allowNull: true,
    unique: true,
    field: 'staff_id'
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false,
    field: 'name'
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true,
    field: 'email'
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false,
    field: 'password'
  },
  role: { 
    type: DataTypes.ENUM('admin', 'teacher'), 
    allowNull: false,
    defaultValue: 'teacher',
    field: 'role'
  }
}, {
  timestamps: true,
  underscored: true,  // ✅ FIXED: Enable for consistency
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'users'
});

// ========================================
// DEFINE RELATIONSHIPS
// ========================================

Student.hasMany(Attendance, { 
  foreignKey: 'StudentId',
  onDelete: "CASCADE",
  onUpdate: "CASCADE"
});
Attendance.belongsTo(Student, { 
  foreignKey: 'StudentId' 
});

// ========================================
// EXPORT MODELS
// ========================================

module.exports = { 
  sequelize, 
  Student, 
  Attendance, 
  User 
};