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
import InvoiceDetail from './invoice-detail';
import InvoiceState from './invoice-state';
import Location from './location';
import PaymentInvoice from './payment-invoice';
import Product from './product';
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

// Invoice → Client (Many-to-One)
Invoice.belongsTo(Client, {
  foreignKey: 'id_client',
  as: 'client',
});
Client.hasMany(Invoice, {
  foreignKey: 'id_client',
  as: 'invoices',
});

// Invoice → Company (Many-to-One)
Invoice.belongsTo(Company, {
  foreignKey: 'id_company',
  as: 'company',
});
Company.hasMany(Invoice, {
  foreignKey: 'id_company',
  as: 'invoices',
});

// Invoice → User (Many-to-One)
Invoice.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'seller',
});
User.hasMany(Invoice, {
  foreignKey: 'id_user',
  as: 'invoices',
});

// Invoice → InvoiceState (Many-to-One)
Invoice.belongsTo(InvoiceState, {
  foreignKey: 'id_invoice-state',
  as: 'invoiceState',
});
InvoiceState.hasMany(Invoice, {
  foreignKey: 'id_invoice-state',
  as: 'invoices',
});

// InvoiceDetail → Invoice (Many-to-One)
InvoiceDetail.belongsTo(Invoice, {
  foreignKey: 'id_invoice',
  as: 'invoice',
});
Invoice.hasMany(InvoiceDetail, {
  foreignKey: 'id_invoice',
  as: 'invoiceDetails',
});

// InvoiceDetail → Product (Many-to-One)
InvoiceDetail.belongsTo(Product, {
  foreignKey: 'id_product',
  as: 'product',
});
Product.hasMany(InvoiceDetail, {
  foreignKey: 'id_product',
  as: 'invoiceDetails',
});

// PaymentInvoice → Invoice (Many-to-One)
PaymentInvoice.belongsTo(Invoice, {
  foreignKey: 'id_invoice',
  as: 'invoice',
});
Invoice.hasMany(PaymentInvoice, {
  foreignKey: 'id_invoice',
  as: 'payments',
});

PaymentInvoice.belongsTo(Bank, {
  foreignKey: 'id_bank',
  as: 'bank',
  constraints: false, // No enforced FK constraint porque id_bank puede ser texto
});
Bank.hasMany(PaymentInvoice, {
  foreignKey: 'id_bank',
  as: 'payments',
  constraints: false, // No enforced FK constraint porque id_bank puede ser texto
});

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

// DeviceAssigned → Client (Many-to-One) - Manteniendo solo la relación con cliente
// La relación con Sale se removió porque ahora usamos Invoice

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
  InvoiceDetail,
  InvoiceState,
  Location,
  PaymentInvoice,
  Product,
  Simulation,
  TypePayment,
  TypeUser,
  User,
};
