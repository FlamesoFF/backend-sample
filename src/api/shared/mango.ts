export namespace Query {

    export namespace Tasks {

        const incompleted = {
            completed_on: {
                $exists: false
            }
        };

        const completed = {
            completed_on: {
                $exists: true
            }
        };

        export const groups = {
            toMe: (userId: string) => ({
                ...incompleted,
                relations: {
                    $elemMatch: {
                        type: 'assigned_to',
                        node: {
                            _id: { $eq: userId }
                        }
                    }
                }
            }),

            fromMe: (userId: string) => ({
                ...incompleted,
                relations: {
                    $and: [

                        {
                            $elemMatch: {
                                type: 'assigned_by',
                                node: {
                                    _id: { $eq: userId }
                                }
                            }
                        },

                        {
                            $elemMatch: {
                                type: 'assigned_to',
                                node: {
                                    _id: { $ne: userId }
                                }
                            }
                        }

                    ]
                }
            }),

            completed: (userId: string) => ({
                ...completed,
                relations: {
                    $or: [

                        {
                            $elemMatch: {
                                type: 'assigned_by',
                                node: {
                                    _id: { $eq: userId }
                                }
                            }
                        },

                        {
                            $elemMatch: {
                                type: 'assigned_to',
                                node: {
                                    _id: { $ne: userId }
                                }
                            }
                        }

                    ]
                }
            }),
        };

    }

}