import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

// A auto-avaliação do aluno como o servidor a devolve. O cliente não refaz
// nenhuma regra de negócio: ele só mostra o que o servidor diz.
export interface AutoavaliacaoDoAluno {
  turma: string;
  metas: string[];
  conceitos: { [meta: string]: string | null };
  aberta: boolean;
}

export interface RespostaDoServidor {
  success?: string;
  failure?: string;
}

@Injectable({ providedIn: 'root' })
export class AutoavaliacaoService {
  private readonly http = inject(HttpClient);
  private readonly servidor = 'http://localhost:3000';

  autoavaliacaoDe(cpf: string): Observable<AutoavaliacaoDoAluno> {
    return this.http.get<AutoavaliacaoDoAluno>(this.url(cpf));
  }

  registrarConceito(cpf: string, meta: string, conceito: string): Observable<RespostaDoServidor> {
    return this.http.put<RespostaDoServidor>(this.url(cpf), { meta: meta, conceito: conceito });
  }

  removerConceito(cpf: string, meta: string): Observable<RespostaDoServidor> {
    return this.http.delete<RespostaDoServidor>(this.url(cpf) + '/' + encodeURIComponent(meta));
  }

  private url(cpf: string): string {
    return this.servidor + '/autoavaliacao/' + encodeURIComponent(cpf);
  }
}
