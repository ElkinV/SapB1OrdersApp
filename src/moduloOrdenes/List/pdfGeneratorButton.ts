import jsPDF from "jspdf";
import "jspdf-autotable";
import {OrderDetails} from "../types.ts";

export const  generatePDF = async (details: OrderDetails[] | null, orderId?: number): Promise<void> => {
    if (!details?.length) return;

    const doc = new jsPDF('p', 'mm', 'letter');
    const currentDate = new Date().toLocaleString();
    let vigencia;
    // eslint-disable-next-line prefer-const
    vigencia = vigencia? details[0].vigenciaOrdr* 24: 48;
    const serie = details[0].series[0] == 'C'? "COTIZACION": "Pedido Cliente";



    // Header
    doc.setFont("arial", "bold");
    doc.setFontSize(10);
    doc.text("RLPHARMA SAS", 93, 8);

    // Company Info
    doc.setFont("arial", "normal");
    doc.setFontSize(9);
    doc.text("Nit. 900774610-9", 96, 12);
    doc.text("Dirección: BARRIO ARMENIA CRA 49 #30B-46", 75, 16);
    doc.text("Teléfonos: 3188371830", 92, 20);
    doc.text("CARTAGENA", 98, 24);

    //doc.addImage("https://i.ibb.co/Dp5rVzm/Logo-RLPharma.png",'JPG',14, 8, 50, 14)

    // Title
    doc.setFontSize(11);
    doc.setFont("arial", "bold");
    doc.text(serie, 95, 32);
    doc.setTextColor("red")
    doc.text(`Valida por ${vigencia} horas`, 91, 36);

    doc.setTextColor("black")
    // Timestamp
    doc.setFontSize(7);
    doc.setFont("arial", "normal");
    doc.text(`Fecha y hora de impresion: ${currentDate}`, 148.5, 36);
    doc.text(`No. de Documento: ${details[0].docNum}`, 14.5, 36);
    doc.line(14, 38, 201.5, 38);


    const summary2 = [
        ["Nit", details[0].nit],
        ["Ciudad", details[0].city],
        ["Telefono", details[0].telefono],
        ["Forma de Pago", details[0].formaDePago]
        ];

    // Summary Table
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    doc.autoTable({
        startY: 40,
        body: summary2,
        theme: "grid",
        styles: {
            fontSize: 7,
            cellPadding: 2
        },
        columnStyles: {
            0: {
                cellWidth: 24,
                fontStyle: "bold",
                fillColor: [200, 200, 200],
                textColor: [0, 0, 0]
            },
            1: {
                cellWidth: 30,
                halign: "left"
            }
        },
        margin: { left: doc.internal.pageSize.width - 68.5 },
        tableWidth: 2000
    });
    const summary1 = [
        ["Cliente", details[0].cardName],
        ["Direccion", details[0].direccion],
        ["E_Mail", details[0].email],
        ["Vendedor", details[0].vendedor],
    ];

    // Summary Table
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    doc.autoTable({

        startY: 40,
        body: summary1,
        theme: "grid",
        styles: {
            fontSize: 7,
            cellPadding: 2
        },
        columnStyles: {
            0: {
                cellWidth: 20,
                fontStyle: "bold",
                fillColor: [200, 200, 200],
                textColor: [0, 0, 0]
            },
            1: {
                cellWidth: 112.8,
                halign: "left"
            }
        },
        margin: { left: doc.internal.pageSize.width - 201.5 },
        tableWidth: 140
    });

    // Table Configuration
    const columns = [
        "Código",
        "Nombre",
        "Cant.",
        "Valor unitario",
        "IVA %",
        "Dscto",
        "Total bruto",
        "F_Vence",
        "Reg. Invima",
        "CUM"
    ];

    const tableData = details.map((item) => [
        item.itemCode,
        item.description,
        item.quantity,
        item.price.toLocaleString("es-CO", { minimumFractionDigits: 2 }),
        item.IVA,
        "0,00",
        item.total.toLocaleString("es-CO", { minimumFractionDigits: 2 }),
        item.vence || "N/A",
        item.regInvima||"" ,
        item.cum
    ]);

    // Generate Table
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    doc.autoTable({
        head: [columns],
        body: tableData,
        startY: doc.lastAutoTable.finalY + 2,
        theme: "grid",
        styles: {
            fontSize: 5.5,
            cellPadding: 2
        },
        headStyles: {
            fillColor: [200, 200, 200],
            textColor: [0, 0, 0],
            fontStyle: "bold"
        }
    });

    // Summary Calculations
    const totalBruto = details[0].totalAntesDeImpuestos;
    const totalIVA = details[0].impuesto;
    const totalPedido =  details[0].totalOrdn ;

    const summary = [
        [`Fecha del documento: ${details[0].docDate}`, "Total bruto", totalBruto.toLocaleString("es-CO", { minimumFractionDigits: 2 })],
        [`Observaciones: "${details[0].comments}"`,"Total descuento", "0,00"],
        ["","Total venta neta", totalBruto.toLocaleString("es-CO", { minimumFractionDigits: 2 })],
        ["","Total IVA", totalIVA.toLocaleString()],
        ["","Total pedido", totalPedido.toLocaleString("es-CO", { minimumFractionDigits: 2 })]
    ];

    // Summary Table
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    doc.autoTable({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        startY: doc.lastAutoTable.finalY + 2,
        body: summary,
        theme: "grid",
        styles: {
            fontSize: 5.5,
            cellPadding: 2
        },
        columnStyles: {
            0: {
                cellWidth: 127.8,
                halign: "left"
            },
            1: {
                cellWidth: 30,
                fontStyle: "bold",
                fillColor: [200, 200, 200],
                textColor: [0, 0, 0]
            },
            2: {
                cellWidth: 30,
                halign: "right"
            },
        },
        didParseCell: function(data: { column: { index: number; }; row: { index: number; }; cell: { rowSpan: number; styles: { valign: string; }; skip: boolean; }; }) {
            if (data.column.index === 0) {
                if (data.row.index === 1) { // Primera fila del grupo a combinar
                    data.cell.rowSpan = 4;
                    data.cell.styles.valign = 'top'; // Centrar verticalmente
                } else if (data.row.index > 1) { // Resto de filas a combinar
                    data.cell.skip = true;
                }
            }
        },
        margin: { left: doc.internal.pageSize.width - 201.8 },
        tableWidth: 140
    });




    doc.setFontSize(9);
    doc.text(` ${details[0].u_name}`, 42, 259);
    doc.line(32, 260, 75, 260);
    doc.text(`Elaborado por`, 45, 263);
    doc.line(140, 260, 183, 260);
    doc.text(`Recibido por`, 155, 263);

    //





    doc.save(`Orden_de_venta_${orderId || "11586"}.pdf`);
};