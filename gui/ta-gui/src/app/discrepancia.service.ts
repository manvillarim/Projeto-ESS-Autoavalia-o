import { Injectable }    from '@angular/core';
import { Http }          from '@angular/http';

@Injectable()
export class DiscrepanciaService {

  private taURL = 'http://localhost:3000';

  constructor(private http: Http) { }

  getDiscrepancias(turma: string, ordenado: boolean = false): Promise<any> {
    var ordem: string = ordenado ? "?ordem=discrepancia-decrescente" : "";
    return this.http.get(this.taURL + "/turma/" + encodeURIComponent(turma) + "/discrepancias" + ordem)
             .toPromise()
             .then(res => res.json())
             .catch(erro => this.tratarErro(erro));
  }

  urlDoCsv(turma: string): string {
    return this.taURL + "/turma/" + encodeURIComponent(turma) + "/discrepancias/csv";
  }

  // Prefere o motivo informado pelo servidor (por exemplo, turma não encontrada)
  // à mensagem genérica de falha de acesso.
  private tratarErro(erro: any): Promise<any>{
    console.error('Acesso mal sucedido ao serviço de discrepâncias',erro);
    var motivo: string = null;
    try { motivo = erro.json().failure; } catch (e) { }
    return Promise.reject(motivo || erro.message || erro);
  }
}
