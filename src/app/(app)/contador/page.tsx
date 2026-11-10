import type { Metadata } from "next";
import { Clientes } from "./Clientes";

export const metadata: Metadata = { title: "Clientes" };

export default function PaginaClientes() {
  return <Clientes />;
}
