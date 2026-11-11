import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ALUNO_LOGADO } from './aluno-logado';
import { AutoavaliacaoService, RespostaDoServidor } from './autoavaliacao.service';

// Uma meta da turma na tela: o conceito que está registrado no servidor e o
// conceito que o aluno está editando, separados para que a tela só passe a
// mostrar o novo valor depois que o servidor o aceitar.
interface LinhaDeMeta {
  meta: string;
  registrado: string | null;
  editado: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly servico = inject(AutoavaliacaoService);

  protected readonly aluno = ALUNO_LOGADO;
  protected readonly turma = signal('');
  protected readonly aberta = signal(true);
  protected readonly linhas = signal<LinhaDeMeta[]>([]);
  protected readonly confirmacao = signal('');
  protected readonly erro = signal('');

  constructor() {
    this.carregar();
  }

  protected atribuir(meta: string, conceito: string): void {
    this.linhas.update((linhas) =>
      linhas.map((linha) => (linha.meta === meta ? { ...linha, editado: conceito } : linha)),
    );
  }

  protected remover(meta: string): void {
    this.atribuir(meta, '');
  }

  // Envia ao servidor apenas as metas que o aluno mudou, uma a uma, e para na
  // primeira recusa, para que a tela mostre exatamente o motivo da recusa.
  protected async salvar(): Promise<void> {
    this.confirmacao.set('');
    this.erro.set('');
    for (const linha of this.linhas()) {
      if (linha.editado === (linha.registrado ?? '')) continue;
      const falha = await this.enviar(linha);
      if (falha) {
        this.erro.set(falha);
        await this.carregar();
        return;
      }
    }
    await this.carregar();
    this.confirmacao.set('Sua auto-avaliação foi salva');
  }

  private async enviar(linha: LinhaDeMeta): Promise<string> {
    const envio =
      linha.editado === ''
        ? this.servico.removerConceito(this.aluno.cpf, linha.meta)
        : this.servico.registrarConceito(this.aluno.cpf, linha.meta, linha.editado);
    try {
      const resposta: RespostaDoServidor = await firstValueFrom(envio);
      return resposta.failure ?? '';
    } catch (erro) {
      return this.falhaDe(erro);
    }
  }

  private falhaDe(erro: unknown): string {
    const resposta = erro as HttpErrorResponse;
    return resposta?.error?.failure ?? 'Não foi possível falar com o servidor';
  }

  private async carregar(): Promise<void> {
    const autoavaliacao = await firstValueFrom(this.servico.autoavaliacaoDe(this.aluno.cpf));
    this.turma.set(autoavaliacao.turma);
    this.aberta.set(autoavaliacao.aberta);
    this.linhas.set(
      autoavaliacao.metas.map((meta) => ({
        meta: meta,
        registrado: autoavaliacao.conceitos[meta],
        editado: autoavaliacao.conceitos[meta] ?? '',
      })),
    );
  }
}
