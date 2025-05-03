export interface SalesOrder {
  id?: number;
  customerName: string;
  cardCode: string;
  items: Item[];
  total: number;
  date: string;
  comments: string;
  user: string;
  docNum: number;
  series: number;
  docStatus: string;
}

export interface Customer {
  id: string;
  name: string;
  priceList: number;
  margen: string;
}

export interface Item {
  itemCode: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  isRefrigerado: boolean;
  WarehouseCode?: string;
}

export interface OrderDetails {
  cardName: string;
  itemCode: string;
  description: string;
  quantity: number;
  price: number;
  margen: number;
  total: number;
  vence: string;
  venceMes: string;
  series: string;
  totalAntesDeImpuestos: number;
  impuesto: string;
  totalOrdn: number;
  direccion: string;
  email: string;
  vendedor: string;
  nit:string;
  telefono: string;
  u_name:string;
  comments: string;
  docNum: number;
  docDate: string;
  cum: string;
  regInvima: string;
  IVA: number;
  formaDePago:string;
  vigenciaOrdr: number;
  docEntry: number;
  docStatus: string;
  listNum: number;
  city: string;
  isRefrigerado: boolean;

}

export interface DocumentLineItems {
  LineNum: number;
  ItemCode: string;
  Quantity: number;
  Currency: string;
  CostingCode: string;
  COGSCostingCode2: string;
  Price: number;
  U_RL_Margen?: number;
  WarehouseCode?: string;
  Description?: string;
  IsRefrigerado?: boolean;
}
