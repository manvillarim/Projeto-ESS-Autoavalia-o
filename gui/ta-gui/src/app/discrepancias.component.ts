import { Component } from '@angular/core';

import { DiscrepanciaService } from './discrepancia.service';

@Component({
  selector: 'discrepancias',
  templateUrl: './discrepancias.component.html',
  styleUrls: ['./discrepancias.component.css']
})
export class DiscrepanciasComponent {
   constructor(private discrepanciaService: DiscrepanciaService) {}

   nomeDaTurma: string = "";
   relatorio: any = null;
   erro: string = null;

   abrir(): void {
      this.buscar(false);
   }

   ordenarPorDiscrepancia(): void {
      this.buscar(true);
   }

   private buscar(ordenado: boolean): void {
      this.discrepanciaService.getDiscrepancias(this.nomeDaTurma, ordenado)
         .then(relatorio => { this.relatorio = relatorio; this.erro = null; })
         .catch(erro => { this.relatorio = null; this.erro = erro; });
   }
}
