import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FirebaseService } from 'src/app/services/firebase.service';
import * as QRCode from 'qrcode-generator';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<any>
  baseSeleccionada = ""
  displayedColumns: string[] = ['QR', 'Evento', 'Valor', 'Nombre', 'personas', 'transaccion', 'fecha'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  spinner!: boolean;
  conts:any={}
  nombres:any={}
  constructor(private firebase: FirebaseService,
    private modalService: BsModalService,
  ) {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.paginator = this.paginator;
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  formatfecha(fecha: string) {

    const fechaDate = new Date(fecha);

    // Obtener el nombre del día
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const nombreDia = diasSemana[fechaDate.getUTCDay()];

    // Obtener la fecha en formato dd/mm/aaaa
    const dia = fechaDate.getUTCDate().toString().padStart(2, '0');
    const mes = (fechaDate.getUTCMonth() + 1).toString().padStart(2, '0'); // Se suma 1 porque los meses van de 0 a 11
    const año = fechaDate.getUTCFullYear();

    // Obtener la hora en formato hh:mm
    const hora = fechaDate.getUTCHours().toString().padStart(2, '0');
    const minutos = fechaDate.getUTCMinutes().toString().padStart(2, '0');

    const formatoDeseado = `${nombreDia}, ${dia}/${mes}/${año} ${hora}:${minutos}`;
    return formatoDeseado


  }
  cont: number = 0
  async ngOnInit(): Promise<void> {
    this.spinner = true
    // let asientos = await this.firebase.getAsientoByEstadoString("ocupado")
    //console.log(asientos)
    //  asientos.forEach(async (asiento:any)=>{
    //    asiento.estado="libre"
    //    asiento.clienteUser="null"
    //    if(asiento.clienteUSer){
    //      delete asiento.clienteUSer
    //    }
    //    asiento.clienteEstado="null"
    //  })
    let asientosFactura: string[] = []
    this.firebase.getAuthState().subscribe(user => {
      if (user!.uid === "NNcOSeH29sRCTw7LDqOlthXdg8E3") {
        this.firebase.getFacturas().subscribe(res => {
          let data = res.filter((factura: any) => {
            if (factura.eventoData) {
              return factura.eventoData.nombre.split(" ")[0] === "Halloween" && factura.transaccion.data.transaction.status === 'APPROVED'
            }
            return false
          })
          this.cont = 0
          data.forEach(async (factura: any) => {
            let llaves=Object.keys(factura.detalle)
            let numNiños=0
            let numAdultos=0
            llaves.forEach((llave:string)=>{
              numNiños+=parseInt(factura.detalle[llave].ninos)
              numAdultos+=parseInt(factura.detalle[llave].adultos)
            })
            this.cont += factura.asientos.length
            if(this.conts[factura.evento]){
              
              this.conts[factura.evento].ninos+=numNiños
              this.conts[factura.evento].adultos+=numAdultos
            }else{
              this.nombres[factura.evento]=factura.eventoData.nombre
              this.conts[factura.evento]={
                ninos:numNiños,
                adultos:numAdultos
              }
            }
            // factura.asientos.forEach((mesa:any)=>{
            //   asientosFactura.push(mesa.split(",")[1].split("/")[0])
            // })
          })
          // console.log(asientosFactura)
          // let Existe: any[] = []
          // asientosFactura.forEach((mesa: string) => {
          //   let existe = asientos.filter((mesaA: any) => {
          //     return mesaA.id === mesa
          //   })
          //   Existe.push(existe[0])
          // })

          // let diferencia = asientos.filter(item => !Existe.includes(item));
          // console.log(diferencia)
          this.dataSource.data = data
          this.dataSource.paginator = this.paginator;
        })
      }
    })

  }
  generateQRCodeBase64(qrData: string) {
    const qr = QRCode(0, 'L');
    qr.addData(qrData);
    qr.make();
    return qr.createDataURL(10, 0);
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  openQR(codigo: string, template: TemplateRef<any>) {
    this.baseSeleccionada = codigo
    this.openModal(template)
  }
  modalRef?: BsModalRef;
  openModal(template: TemplateRef<any>) {

    this.modalRef = this.modalService.show(template);


  }
  formatAsientos(asientos: any[]) {
    let asientosString: string = ""
    asientos.forEach(asiento => {
      asientosString += (asiento.split("/")[1] + ', ')
    })
    return asientosString.slice(0, -2)
  }
  formatZonas(asientos: any[]) {
    let asientosString: string[] = []
    asientos.forEach(asiento => {
      asientosString.push(asiento.split(",")[0])
    })
    asientosString = asientosString.filter((item, index) => {
      return asientosString.indexOf(item) === index;
    })
    return asientosString
  }
  iterObject(elemento: any) {
    let claves = Object.keys(elemento)
    let asistentes: string = ""
    claves.forEach(clave => {
      asistentes += `<br>${clave}<br>Niños: ${elemento[clave].ninos}<br>Adultos: ${elemento[clave].adultos}<br>`
    })
    return asistentes
  }
  toArray(){
    return Object.keys(this.nombres)
  }
}
