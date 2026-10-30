import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Nota {
  titulo: string;
  conteudo: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  notas: Nota[] = [];

  titulo = '';
  conteudo = '';
  pesquisa = '';

  editando = false;
  indiceEditando = -1;

  constructor() {
    this.carregarNotas();
  }

  novaNota() {
    this.titulo = '';
    this.conteudo = '';
    this.indiceEditando = -1;
    this.editando = true;
  }

  salvarNota() {

    if (!this.titulo.trim() || !this.conteudo.trim()) {
      alert('Preencha o título e o conteúdo da nota.');
      return;
    }

    const nota: Nota = {
      titulo: this.titulo,
      conteudo: this.conteudo
    };

    if (this.indiceEditando === -1) {
      this.notas.push(nota);
    } else {
      this.notas[this.indiceEditando] = nota;
    }

    this.salvarLocalStorage();
    this.cancelar();
  }

  editarNota(index: number) {

    const nota = this.notas[index];

    this.titulo = nota.titulo;
    this.conteudo = nota.conteudo;

    this.indiceEditando = index;
    this.editando = true;
  }

  excluirNota(index: number) {

    const confirmar = confirm('Deseja realmente excluir esta nota?');

    if (!confirmar) {
      return;
    }

    this.notas.splice(index, 1);

    this.salvarLocalStorage();
  }

  cancelar() {
    this.titulo = '';
    this.conteudo = '';
    this.indiceEditando = -1;
    this.editando = false;
  }

  get notasFiltradas(): Nota[] {

    const texto = this.pesquisa.toLowerCase();

    return this.notas.filter(nota =>
      nota.titulo.toLowerCase().includes(texto) ||
      nota.conteudo.toLowerCase().includes(texto)
    );
  }

  salvarLocalStorage() {
    localStorage.setItem('notas', JSON.stringify(this.notas));
  }

  carregarNotas() {

    const dados = localStorage.getItem('notas');

    if (dados) {
      this.notas = JSON.parse(dados);
    }
  }
}