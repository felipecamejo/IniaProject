import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TetrazolioComponent } from './tetrazolio.component';

describe('TetrazolioComponent', () => {
  let component: TetrazolioComponent;
  let fixture: ComponentFixture<TetrazolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TetrazolioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TetrazolioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
