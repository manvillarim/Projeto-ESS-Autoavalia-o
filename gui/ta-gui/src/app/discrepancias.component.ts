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

   abrir(): void {
      this.discrepanciaService.getDiscrepancias(this.nomeDaTurma)
         .then(relatorio => this.relatorio = relatorio)
         .catch(erro => alert(erro));
   }
}
