import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurezaComponent } from './pureza.component';

describe('PurezaComponent', () => {
  let component: PurezaComponent;
  let fixture: ComponentFixture<PurezaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurezaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurezaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
