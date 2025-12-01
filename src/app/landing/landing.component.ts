import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragMove } from '@angular/cdk/drag-drop';

interface Field {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  description: string;
}

interface TableNode {
  id: string;
  name: string;
  x: number;
  y: number;
  initialX: number;
  initialY: number;
  width: number;
  height: number;
  fields: Field[];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {

  selectedField: Field | null = null;
  selectedTable: string | null = null;

  // Initial positions and data
  nodes: TableNode[] = [
    {
      id: 'users',
      name: 'public.users',
      x: 40,
      y: 40,
      initialX: 40,
      initialY: 40,
      width: 224,
      height: 180,
      fields: [
        { name: 'id', type: 'uuid', isPk: true, description: 'Unique identifier for the user. Automatically generated.' },
        { name: 'email', type: 'varchar', description: 'User email address. Must be unique.' },
        { name: 'full_name', type: 'text', description: 'Full name of the user as displayed in profile.' },
        { name: 'created_at', type: 'timestamptz', description: 'Timestamp when the user account was created.' }
      ]
    },
    {
      id: 'posts',
      name: 'public.posts',
      x: 320,
      y: 160,
      initialX: 320,
      initialY: 160,
      width: 224,
      height: 180,
      fields: [
        { name: 'id', type: 'uuid', isPk: true, description: 'Unique identifier for the post.' },
        { name: 'user_id', type: 'uuid', isFk: true, description: 'Foreign key referencing public.users(id).' },
        { name: 'title', type: 'text', description: 'Title of the post.' },
        { name: 'content', type: 'text', description: 'Main content body of the post.' }
      ]
    }
  ];

  connectionPath: string = '';

  constructor() {
    this.updateConnection();
  }

  selectField(table: string, field: Field) {
    this.selectedTable = table;
    this.selectedField = field;
  }

  closeSidebar() {
    this.selectedField = null;
    this.selectedTable = null;
  }

  // Handle drag move to update lines in real-time
  onDragMoved(event: CdkDragMove, nodeIndex: number) {
    const dragPos = event.source.getFreeDragPosition();
    const node = this.nodes[nodeIndex];
    // Update the current coordinates for drawing the lines
    // based on initial position + drag delta
    node.x = node.initialX + dragPos.x;
    node.y = node.initialY + dragPos.y;

    this.updateConnection();
  }

  updateConnection() {
    const users = this.nodes[0];
    const posts = this.nodes[1];

    // Connect from right side of Users to left side of Posts
    // Users (source) - id field is first row (approx 45px down from top)
    const startX = users.x + users.width;
    const startY = users.y + 55;

    // Posts (target) - user_id field is second row (approx 85px down from top)
    const endX = posts.x;
    const endY = posts.y + 90;

    // Bezier curve
    const controlPointOffset = Math.abs(endX - startX) * 0.5;
    const cp1x = startX + controlPointOffset;
    const cp1y = startY;
    const cp2x = endX - controlPointOffset;
    const cp2y = endY;

    this.connectionPath = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
  }
}
