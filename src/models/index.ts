// Importar todos los modelos
import Accessory from './accessory';
import Bank from './bank';
import Category from './category';
import City from './city';
import Client from './client';
import CompanyClient from './client-company';
import Company from './company';
import Department from './department';
import Device from './device';
import DeviceAssigned from './device-assigned';
import Inventory from './inventory';
import Invoice from './invoice';
import Location from './location';
import Payment from './payment';
import Product from './product';
import Sale from './sale';
import Simulation from './simulation';
import TypePayment from './type-payment';
import TypeUser from './type-user';
import User from './user';

// ==================== RELACIONES PRINCIPALES ====================

// Client ↔ Company (Many-to-Many)
Client.belongsToMany(Company, {
  through: CompanyClient,
  foreignKey: 'id_client',
  otherKey: 'id_company',
  as: 'companies',
});

Company.belongsToMany(Client, {
  through: CompanyClient,
  foreignKey: 'id_company',
  otherKey: 'id_client',
  as: 'clients',
});

// User → TypeUser (Many-to-One)
User.belongsTo(TypeUser, {
  foreignKey: 'id_type_user',
  as: 'userType',
});
TypeUser.hasMany(User, {
  foreignKey: 'id_type_user',
  as: 'users',
});

// Client → User (Many-to-One)
Client.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user',
});
User.hasMany(Client, {
  foreignKey: 'id_user',
  as: 'clients',
});

// Company → User (Many-to-One)
Company.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user',
});
User.hasMany(Company, {
  foreignKey: 'id_user',
  as: 'companies',
});

// ==================== RELACIONES DE UBICACIÓN ====================

// City → Department (Many-to-One)
City.belongsTo(Department, {
  foreignKey: 'id_department',
  as: 'department',
});
Department.hasMany(City, {
  foreignKey: 'id_department',
  as: 'cities',
});

// ==================== RELACIONES DE PRODUCTOS ====================

// Product → Category (Many-to-One) - Verificar si existe id_category en Product
// Product.belongsTo(Category, {
//   foreignKey: "id_category",
//   as: "category",
// });
// Category.hasMany(Product, {
//   foreignKey: "id_category",
//   as: "products",
// });

// Accessory → Product (Many-to-One)
Accessory.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product',
});
Product.hasMany(Accessory, {
  foreignKey: 'id_product',
  as: 'accessories',
});

// Inventory → Product (Many-to-One)
Inventory.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product',
});
Product.hasMany(Inventory, {
  foreignKey: 'id_product',
  as: 'inventoryMovements',
});

// ==================== RELACIONES DE VENTAS ====================

// Sale → Client (Many-to-One)
Sale.belongsTo(Client, {
  foreignKey: 'id_client',
  as: 'client',
});
Client.hasMany(Sale, {
  foreignKey: 'id_client',
  as: 'sales',
});

// Sale → Company (Many-to-One)
Sale.belongsTo(Company, {
  foreignKey: 'id_company',
  as: 'company',
});
Company.hasMany(Sale, {
  foreignKey: 'id_company',
  as: 'sales',
});

// Sale → User (Many-to-One)
Sale.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'seller',
});
User.hasMany(Sale, {
  foreignKey: 'id_user',
  as: 'sales',
});

// Invoice → Sale (One-to-One)
Invoice.belongsTo(Sale, {
  foreignKey: 'id_sale',
  as: 'sale',
});
Sale.hasOne(Invoice, {
  foreignKey: 'id_sale',
  as: 'invoice',
});

// Payment → Sale (Many-to-One)
Payment.belongsTo(Sale, {
  foreignKey: 'id_sale',
  as: 'sale',
});
Sale.hasMany(Payment, {
  foreignKey: 'id_sale',
  as: 'payments',
});

// Payment → TypePayment (Many-to-One)
Payment.belongsTo(TypePayment, {
  foreignKey: 'id_type_payment',
  as: 'paymentType',
});
TypePayment.hasMany(Payment, {
  foreignKey: 'id_type_payment',
  as: 'payments',
});

// ==================== RELACIONES DE DISPOSITIVOS ====================

// Location → Device (Many-to-One)
Location.belongsTo(Device, {
  foreignKey: 'id_device',
  as: 'device',
});
Device.hasMany(Location, {
  foreignKey: 'id_device',
  as: 'locations',
});

// DeviceAssigned → Device (Many-to-One)
DeviceAssigned.belongsTo(Device, {
  foreignKey: 'id_device',
  as: 'device',
});
Device.hasMany(DeviceAssigned, {
  foreignKey: 'id_device',
  as: 'assignments',
});

// DeviceAssigned → Client (Many-to-One)
DeviceAssigned.belongsTo(Client, {
  foreignKey: 'id_client',
  as: 'client',
});
Client.hasMany(DeviceAssigned, {
  foreignKey: 'id_client',
  as: 'deviceAssignments',
});

// DeviceAssigned → Sale (Many-to-One)
DeviceAssigned.belongsTo(Sale, {
  foreignKey: 'id_sale',
  as: 'sale',
});
Sale.hasMany(DeviceAssigned, {
  foreignKey: 'id_sale',
  as: 'deviceAssignments',
});

// Simulation → Client (Many-to-One)
Simulation.belongsTo(Client, {
  foreignKey: 'id_client',
  as: 'client',
});
Client.hasMany(Simulation, {
  foreignKey: 'id_client',
  as: 'simulations',
});

// Simulation → Device (Many-to-One)
Simulation.belongsTo(Device, {
  foreignKey: 'id_device',
  as: 'device',
});
Device.hasMany(Simulation, {
  foreignKey: 'id_device',
  as: 'simulations',
});

// ==================== EXPORTACIONES ====================
export {
  Accessory,
  Bank,
  Category,
  City,
  Client,
  Company,
  CompanyClient,
  Department,
  Device,
  DeviceAssigned,
  Inventory,
  Invoice,
  Location,
  Payment,
  Product,
  Sale,
  Simulation,
  TypePayment,
  TypeUser,
  User,
};
