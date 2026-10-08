import { Injectable }    from '@angular/core';
import { Http }          from '@angular/http';

@Injectable()
export class DiscrepanciaService {

  private taURL = 'http://localhost:3000';

  constructor(private http: Http) { }

  getDiscrepancias(turma: string): Promise<any> {
    return this.http.get(this.taURL + "/turma/" + encodeURIComponent(turma) + "/discrepancias")
             .toPromise()
             .then(res => res.json())
             .catch(this.tratarErro);
  }

  private tratarErro(erro: any): Promise<any>{
    console.error('Acesso mal sucedido ao serviço de discrepâncias',erro);
    return Promise.reject(erro.message || erro);
  }
}
