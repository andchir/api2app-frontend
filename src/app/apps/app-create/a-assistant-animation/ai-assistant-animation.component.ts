import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

import { Subject } from 'rxjs';

@Component({
    selector: 'app-ai-assistant-animation',
    standalone: true,
    imports: [NgIf, NgClass],
    templateUrl: './ai-assistant-animation.component.html',
    styles: [`
        @keyframes phraseEnter {
            from { opacity: 0; transform: translateX(60px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes phraseLeave {
            from { opacity: 1; transform: translateY(0); }
            to   { opacity: 0; transform: translateY(-40px); }
        }
        .phrase-enter { animation: phraseEnter 0.5s ease-out forwards; }
        .phrase-leave { animation: phraseLeave 0.5s ease-in forwards; }
        .container-wrap { transition: opacity 0.4s ease; }
    `]
})
export class AiAssistantAnimationComponent implements OnInit, OnDestroy {

    @Output() close: EventEmitter<string> = new EventEmitter<string>();
    errorMessage: string = '';
    destroyed$: Subject<void> = new Subject();
    containerVisible: boolean = true;

    @Input() set visible(v: boolean) {
        this.containerVisible = v;
        this.cdr.detectChanges();
    }

    currentImg: string = 'assets/img/robot-4.png';
    currentPhrase: string = '';
    phraseVisible: boolean = false;
    animationPhase: 'enter' | 'leave' | 'none' = 'none';

    private _currentState: keyof typeof this.states = 'greetings';
    private shuffledPhrases: string[] = [];
    private phraseIndex: number = 0;
    private shownCount: number = 0;
    private running: boolean = false;
    private stateSetByInput: boolean = false;
    private timeouts: ReturnType<typeof setTimeout>[] = [];

    states = {
        greetings: {
            img: 'assets/img/robot-4.png',
            phrases: [
                'Привет! Готов помочь.',
                'Привет! Чем могу помочь?',
                'Привет! Рад тебя видеть.',
                'Добро пожаловать! Чем займёмся?',
                'Привет! Давай создадим что-нибудь интересное.',
            ],
            max: 1,
            next: null
        },
        thinking: {
            img: 'assets/img/robot-1.png',
            phrases: [
                'Принял, анализирую...',
                'Обрабатываю запрос...',
                'Разбираюсь в задаче...',
                'Собираю данные...',
                'Формирую решение...',
                'Почти готово...',
            ],
            max: 1,
            next: 'idea'
        },
        idea: {
            img: 'assets/img/robot-2.png',
            phrases: [
                'Есть идея! Приступаю.',
                'Понял задачу, начинаю!',
                'Отлично, знаю что делать.',
                'Всё ясно, берусь за работу.',
                'Придумал! Сейчас реализую.',
            ],
            max: 1,
            next: 'working'
        },
        working: {
            img: 'assets/img/robot-3.png',
            phrases: [
                'Генерирую структуру...',
                'Настраиваю компоненты...',
                'Прописываю логику...',
                'Связываю блоки...',
                'Проверяю корректность...',
                'Довожу до ума...',
                'Ещё совсем немного...',
            ],
            max: 0,
            next: null
        },
        done: {
            img: 'assets/img/robot-2.png',
            phrases: [
                'Готово! Можешь проверить.',
                'Всё сделал. Посмотри результат.',
                'Приложение готово к работе!',
                'Задача выполнена. Проверяй!',
            ],
            max: 1,
            next: null
        }
    };

    @Input() set state(value: string) {
        if (value && this.states[value as keyof typeof this.states]) {
            this.stateSetByInput = true;
            this.changeState(value as keyof typeof this.states);
        }
    }

    @Input() set stopped(v: boolean) {
        if (v) this.stop();
    }

    constructor(protected cdr: ChangeDetectorRef) {}

    ngOnInit(): void {
        if (!this.stateSetByInput) {
            this.changeState('greetings');
        }
    }

    changeState(state: keyof typeof this.states): void {
        this.clearTimers();
        this._currentState = state;
        this.currentImg = this.states[state].img;
        this.shownCount = 0;
        this.phraseIndex = 0;
        this.shuffledPhrases = this.shuffle([...this.states[state].phrases]);
        this.running = true;
        this.scheduleNextPhrase(0);
    }

    stop(): void {
        if (!this.running) return;
        this.running = false;
        this.clearTimers();
        if (this.phraseVisible) {
            this.animationPhase = 'leave';
            this.cdr.detectChanges();
            this.t(() => {
                this.phraseVisible = false;
                this.animationPhase = 'none';
                this.cdr.detectChanges();
            }, 500);
        }
    }

    private scheduleNextPhrase(delay: number): void {
        this.t(() => {
            if (!this.running) return;
            const cfg = this.states[this._currentState];
            if (cfg.max > 0 && this.shownCount >= cfg.max) {
                if (cfg.next) this.changeState(cfg.next);
                return;
            }
            this.showPhrase(this.shuffledPhrases[this.phraseIndex]);
        }, delay);
    }

    private showPhrase(phrase: string): void {
        this.currentPhrase = phrase;
        this.phraseVisible = true;
        this.animationPhase = 'enter';
        this.cdr.detectChanges();

        // After enter animation finishes (500ms) → stay visible
        this.t(() => {
            this.animationPhase = 'none';
            this.cdr.detectChanges();

            // Stay for 2 seconds, then leave
            this.t(() => {
                if (!this.running && this.animationPhase !== 'none') return;
                this.animationPhase = 'leave';
                this.cdr.detectChanges();

                // After leave animation (500ms) → hide, schedule next
                this.t(() => {
                    this.phraseVisible = false;
                    this.animationPhase = 'none';
                    this.shownCount++;
                    this.phraseIndex = (this.phraseIndex + 1) % this.shuffledPhrases.length;
                    this.cdr.detectChanges();

                    if (!this.running) return;
                    const cfg = this.states[this._currentState];
                    if (cfg.max === 0 || this.shownCount < cfg.max) {
                        this.scheduleNextPhrase(1000);
                    } else if (cfg.next) {
                        this.changeState(cfg.next);
                    }
                }, 500);
            }, 2000);
        }, 500);
    }

    private shuffle<T>(arr: T[]): T[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    private t(fn: () => void, delay: number): void {
        const id = setTimeout(fn, delay);
        this.timeouts.push(id);
    }

    private clearTimers(): void {
        this.timeouts.forEach(clearTimeout);
        this.timeouts = [];
        this.phraseVisible = false;
        this.animationPhase = 'none';
    }

    ngOnDestroy(): void {
        this.clearTimers();
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
