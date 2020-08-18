import { ITimeTrack, Task, TaskPayload } from './types';
import { IComment } from '../../../@types/data/definitions';
import { IFileDetails } from '../../../@types/data/file';
import moment from 'moment';


export class TaskDirector {
    static buildNewTask( data: TaskPayload ) {
        const builder = new TaskBuilder();

        builder.reset();
        builder.setCreatedTime(moment().unix());

        if(data.files) {
            for(const file of data.files){
                builder.addFile(file);
            }
        }

        return builder.getResult();
    }

    static buildNewBreak( data: TaskPayload ) {
        const builder = new TaskBuilder();

        builder.reset();

        return builder.getResult();
    }

    static buildExistingTask(data: TaskPayload ){

    }

    static buildExistingBreak(data: TaskPayload ){

    }
}


class TaskBuilder {
    private task: Task;

    getResult() {
        return this.task;
    }

    reset() {
        this.task = {
            schema_id: 'task_v3',
            class: 'task',
            type: ['task'],
            completed: false,
            description: '',
            timestamps: {
                created: 0,
                reminder: 0,
                completed: 0
            },
            time_track: []
        };
    }

    setCreatedTime( time: number ) {
        this.task.timestamps.created = time;
    }

    setReminderTime( time: number ) {
        this.task.timestamps.reminder = time;
    }

    setCompletedTime( time: number ) {
        this.task.timestamps.completed = time;
    }

    addTimeTrack( timeTrack: ITimeTrack ) {
        this.task.time_track.push(timeTrack);
    }

    setNotes( notes: string ) {
        this.task.notes = notes;
    }

    addComment( comment: IComment ) {
        this.task.comments.push(comment);
    }

    addFile( fileDetail: IFileDetails ) {
        this.task.files.push(fileDetail);
    }
}