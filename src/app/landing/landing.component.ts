import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';

interface TableNode {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number; // approximate for connection calculation
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {

  // Initial positions
  nodes: TableNode[] = [
    { id: 'users', name: 'public.users', x: 40, y: 40, width: 224, height: 180 }, // w-56 = 224px
    { id: 'posts', name: 'public.posts', x: 320, y: 160, width: 224, height: 180 }
  ];

  connectionPath: string = '';

  constructor() {
    this.updateConnection();
  }

  // Handle drag move to update lines in real-time
  onDragMoved(event: CdkDragMove, nodeIndex: number) {
    const element = event.source.element.nativeElement;
    const transform = element.style.transform;
    const regex = /translate3d\(([^p]+)px,\s*([^p]+)px/;
    const match = transform.match(regex);

    // CDK Drag uses translate3d, we need to add that to the initial position to get current visual position
    // However, the cleanest way with Angular CDK to get position relative to container is checking `getFreeDragPosition` if we used that,
    // or just using the event pointer position diff.

    // Easier approach: Use the `cdkDragFreeDragPosition` input binding if we wanted 2-way binding,
    // but here we let DOM handle it and just calculate based on the element's bounding rect relative to the container?
    // No, that's heavy.

    // Let's rely on the pointer position for smooth updates or simply update the stored coordinates
    // CdkDragMove gives us the pointer position.

    const dragPos = event.source.getFreeDragPosition();
    this.nodes[nodeIndex].x = this.getInitialX(nodeIndex) + dragPos.x;
    this.nodes[nodeIndex].y = this.getInitialY(nodeIndex) + dragPos.y;

    this.updateConnection();
  }

  getInitialX(index: number): number {
      return index === 0 ? 40 : 320;
  }

  getInitialY(index: number): number {
      return index === 0 ? 40 : 160;
  }

  updateConnection() {
    const users = this.nodes[0];
    const posts = this.nodes[1];

    // Connect from right side of Users to left side of Posts
    // Users (source)
    const startX = users.x + users.width;
    const startY = users.y + 55; // Approx height of ID field row

    // Posts (target)
    const endX = posts.x;
    const endY = posts.y + 90; // Approx height of user_id field row

    // Bezier curve
    const controlPointOffset = Math.abs(endX - startX) * 0.5;
    const cp1x = startX + controlPointOffset;
    const cp1y = startY;
    const cp2x = endX - controlPointOffset;
    const cp2y = endY;

    this.connectionPath = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  }
}
