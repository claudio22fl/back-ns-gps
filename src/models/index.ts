import Client from "./client";
import CompanyClient from "./client-company";
import Company from "./company";

Client.belongsToMany(Company, {
  through: CompanyClient,
  foreignKey: "id_client",
  otherKey: "id_company",
  as: "companies",
});

Company.belongsToMany(Client, {
  through: CompanyClient,
  foreignKey: "id_company",
  otherKey: "id_client",
  as: "clients",
});

export { Client, Company, CompanyClient };
