import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Cliente } from 'src/app/entities/cliente';
import { FirebaseService } from 'src/app/services/firebase.service';
import { ClientesService } from 'src/app/services/observers/clientes.service';


@Component({
  selector: 'app-clientes-lista',
  templateUrl: './clientes-lista.component.html',
  styleUrls: ['./clientes-lista.component.scss']
})
export class ClientesListaComponent implements OnInit, AfterViewInit {

  dataSource: MatTableDataSource<Cliente>;
  displayedColumns: string[] = ['nit', 'nombre','acciones'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  esAdmin: any
  @Input() showconfig!: string;
  @Output() myEvent = new EventEmitter();
  constructor(private firebaseService: FirebaseService, private router: Router,private Clientes:ClientesService) {
    this.dataSource = new MatTableDataSource<Cliente>();
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  async ngOnInit() {
    this.esAdmin=await this.firebaseService.esAdmin()
    if (this.esAdmin) {
      this.router.navigate(["/admin"])
    }
    this.getClientes();
  }

  getClientes() {
    this.Clientes.provideCliente().subscribe((clientes:any) => {
      this.dataSource.data = clientes;
      console.log(clientes)
    });
  }

  editarCliente(cliente: any) {
    this.router.navigate(['/editarcliente', cliente.id]);
  }

  eliminarCliente(cliente: any) {
    const nit = cliente.id;
    this.firebaseService.eliminarCliente(nit).then(() => {
      this.getClientes();
    }).catch(error => {
      console.log('Error al eliminar el cliente:', error);
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
