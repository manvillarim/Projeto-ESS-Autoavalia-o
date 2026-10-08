import { Injectable }    from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable()
export class DiscrepanciaService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private taURL = 'http://localhost:3000';

  constructor(private http: Http) { }

  getDiscrepancias(turma: string, ordenado: boolean = false): Promise<any> {
    var ordem: string = ordenado ? "?ordem=discrepancia-decrescente" : "";
    return this.http.get(this.taURL + "/turma/" + encodeURIComponent(turma) + "/discrepancias" + ordem)
             .toPromise()
             .then(res => res.json())
             .catch(erro => this.tratarErro(erro));
  }

  getDistribuicao(turma: string): Promise<any> {
    return this.http.get(this.taURL + "/turma/" + encodeURIComponent(turma) + "/discrepancias/distribuicao")
             .toPromise()
             .then(res => res.json())
             .catch(erro => this.tratarErro(erro));
  }

  getNotificacoes(turma: string): Promise<any[]> {
    return this.http.get(this.taURL + "/turma/" + encodeURIComponent(turma) + "/notificacoes")
             .toPromise()
             .then(res => res.json().notificacoes)
             .catch(erro => this.tratarErro(erro));
  }

  definirLimiar(turma: string, limiar: number): Promise<any> {
    return this.http.put(this.taURL + "/turma/" + encodeURIComponent(turma) + "/limiar",
                         JSON.stringify({limiar: limiar}), {headers: this.headers})
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
