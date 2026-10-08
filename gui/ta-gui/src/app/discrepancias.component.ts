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
   aba: string = "lista";
   distribuicao: any[] = [];

   abrir(): void {
      this.buscar(false);
   }

   ordenarPorDiscrepancia(): void {
      this.buscar(true);
   }

   mostrarLista(): void {
      this.aba = "lista";
   }

   mostrarDistribuicao(): void {
      this.discrepanciaService.getDistribuicao(this.relatorio.turma)
         .then(resposta => { this.distribuicao = resposta.distribuicao; this.aba = "distribuicao"; })
         .catch(erro => { this.relatorio = null; this.erro = erro; });
   }

   // Altura da barra em relação à maior quantidade, para que a maior ocupe todo o gráfico.
   alturaDaBarra(quantidade: number): number {
      var maior: number = Math.max(1, ...this.distribuicao.map(f => f.quantidade));
      return 100 * quantidade / maior;
   }

   urlDoCsv(): string {
      return this.discrepanciaService.urlDoCsv(this.relatorio.turma);
   }

   private buscar(ordenado: boolean): void {
      this.discrepanciaService.getDiscrepancias(this.nomeDaTurma, ordenado)
         .then(relatorio => { this.relatorio = relatorio; this.erro = null; this.aba = "lista"; })
         .catch(erro => { this.relatorio = null; this.erro = erro; });
   }
}
