import Leave from '../schema/LeaveSchema';
import LeaveNotFound from '../Errors/Leave/LeaveNotFound';
import NoPendingLeave from '../Errors/Leave/NoPendingLeave';
import { UnexpectedError, MissingFieldsError } from '../Errors/Shared';
import Employee from '../schema/employeeSchema';
import MasterEntities from '../schema/masterEntitiesSchema';
import CannotMakeLeave from '../Errors/Leave/CannotMakeLeave';
import {
  handleValidationError,
  intersectionArray,
  cleanObject,
} from '../utils';
import AppError from '../Errors/AppError';

export const addLeave = async (req, res, next) => {
  try {
    const user = req.user.employee;
    const {
      requestFrom,
      requestTo,
      type,
      startDate,
      endDate,
      returnDate,
      reason,
      isAdhocLeave,
      adhocStatus,
      availableOnPhone,
      availableOnCity,
      emergencyContact,
      status,
      approvedBy,
      rejectedBy,
      halfDayStatus,
    } = req.body;

    let sDate = new Date(startDate);
    let eDate = new Date(endDate);

    sDate.setHours(0, 0, 1);
    eDate.setHours(23, 59, 59);

    let appliedLeaves;
    let requestedUserData;

    if (requestFrom == '') {
      appliedLeaves = await Leave.find({
        requestFrom: user.id,
        startDate: sDate,
        endDate: eDate,
      });
    } else {
      appliedLeaves = await Leave.find({
        requestFrom: requestFrom,
        startDate: sDate,
        endDate: eDate,
      });
      requestedUserData = await Employee.findOne({ _id: requestFrom });
    }

    const isAppliedAlready = appliedLeaves.length;

    if (isAppliedAlready !== 0) {
      next(
        new AppError(
          409,
          'Already Applied',
          'Leave with same duration already Exists'
        )
      );
    } else {
      if (requestFrom == '') {
        const requestToEmployee =
          (await Employee.find({ _id: { $in: requestTo } })) || [];
        if (requestToEmployee.length > 0) {
          const leave = new Leave({
            requestFrom: user.id,
            requestTo: requestToEmployee.map((e) => e.id),
            type,
            halfDayStatus,
            startDate: sDate,
            endDate: eDate,
            returnDate,
            reason,
            isAdhocLeave,
            adhocStatus,
            availableOnPhone,
            availableOnCity,
            emergencyContact,
            status,
            approvedBy,
            rejectedBy,
          });

          leave.save((err, leaveData) => {
            if (err) {
              if (err.name === 'ValidationError') {
                next(new MissingFieldsError(handleValidationError(err).fields));
              }
              next(new CannotMakeLeave());
            } else {
              next({
                message: 'Successfully Applied for leave',
                id: leaveData.id,
                requestFrom: {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                },
                requestTo: requestToEmployee.map((e) => ({
                  id: e.id,
                  firstName: e.firstName,
                  lastName: e.lastName,
                  email: e.email,
                  contactNumber: e.contactNumber,
                })),
                halfDayStatus: leave.halfDayStatus,
                type: leaveData.type,
                status: leaveData.status,
                startDate: leaveData.startDate,
                endDate: leaveData.endDate,
                returnDate: leaveData.returnDate,
                reason: leaveData.reason,
                isAdhocLeave: leaveData.isAdhocLeave,
                adhocStatus: leaveData.adhocStatus,
                availableOnPhone: leaveData.availableOnPhone,
                availableOnCity: leaveData.availableOnCity,
                emergencyContact: leaveData.emergencyContact,
                createdAt: leaveData.createdAt,
                updatedAt: leaveData.updatedAt,
              });
            }
          });
        } else {
          next(new CannotMakeLeave('Make request to TL or HR'));
        }
      } else {
        const requestToEmployee =
          (await Employee.find({ _id: { $in: requestTo } })) || [];
        if (requestToEmployee.length > 0) {
          const leave = new Leave({
            requestFrom: requestFrom,
            requestTo: requestToEmployee.map((e) => e.id),
            type,
            halfDayStatus,
            startDate: sDate,
            endDate: eDate,
            returnDate,
            reason,
            isAdhocLeave,
            adhocStatus,
            availableOnPhone,
            availableOnCity,
            emergencyContact,
            status,
            approvedBy,
            rejectedBy,
          });

          leave.save((err, leaveData) => {
            if (err) {
              console.log(err);
              if (err.name === 'ValidationError') {
                next(new MissingFieldsError(handleValidationError(err).fields));
              }
              next(new CannotMakeLeave());
            } else {
              next({
                message: 'Successfully Applied for leave',
                id: leaveData.id,
                requestFrom: {
                  id: requestedUserData.id,
                  firstName: requestedUserData.firstName,
                  lastName: requestedUserData.lastName,
                  email: requestedUserData.email,
                },
                requestTo: requestToEmployee.map((e) => ({
                  id: e.id,
                  firstName: e.firstName,
                  lastName: e.lastName,
                  email: e.email,
                  contactNumber: e.contactNumber,
                })),
                halfDayStatus: leave.halfDayStatus,
                type: leaveData.type,
                status: leaveData.status,
                startDate: leaveData.startDate,
                endDate: leaveData.endDate,
                returnDate: leaveData.returnDate,
                reason: leaveData.reason,
                isAdhocLeave: leaveData.isAdhocLeave,
                adhocStatus: leaveData.adhocStatus,
                availableOnPhone: leaveData.availableOnPhone,
                availableOnCity: leaveData.availableOnCity,
                emergencyContact: leaveData.emergencyContact,
                createdAt: leaveData.createdAt,
                updatedAt: leaveData.updatedAt,
              });
            }
          });
        } else {
          next(new CannotMakeLeave('Make request to TL or HR'));
        }
      }
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      next(new MissingFieldsError(handleValidationError(error).fields));
    }
    next(new UnexpectedError('Leave'));
  }
};

export const getInitialLeaveData = async (req, res, next) => {
  const { year } = req.query;
  let getDate = new Date(year, 3, 1);
  let floorYear = getDate.getFullYear();
  let newDate = new Date(floorYear + 1, 2, 31);
  // let ceilYear = newDate.getFullYear();

  console.log(getDate, newDate);

  const user = req.user.employee;
  try {
    const ownLeaves = await Leave.find({
      requestFrom: user.id,
      createdAt: {
        $gte: getDate,
        $lte: newDate,
      },
    })
      .populate('requestTo', {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      })
      .populate('requestFrom', {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      })
      .populate({
        path: 'approvedBy',
        populate: {
          path: 'author ',
          comment: 1,
        },
      })
      .populate({
        path: 'rejectedBy',
        populate: {
          path: 'author ',
          comment: 1,
        },
      });

    const approvedLeaves = await Leave.find({
      requestFrom: user.id,
      status: 'approved',
    })
      .populate('requestTo', {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      })
      .populate('requestFrom', {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      })
      .populate({
        path: 'approvedBy',
        populate: {
          path: 'author ',
          comment: 1,
        },
      })
      .populate({
        path: 'rejectedBy',
        populate: {
          path: 'author ',
          comment: 1,
        },
      });

    const requestToMe = await Leave.find({
      requestTo: { $in: [user.id] },
      status: 'pending',
    })
      .populate('requestTo', {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      })
      .populate('requestFrom', {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      })
      .populate({
        path: 'approvedBy',
        populate: {
          path: 'author ',
          comment: 1,
        },
      })
      .populate({
        path: 'rejectedBy',
        populate: {
          path: 'author ',
          comment: 1,
        },
      });

    const allLeaves =
      (await Leave.find({ requestFrom: user.id })
        .populate('requestFrom', {
          id: 1,
          firstName: 1,
          lastName: 1,
        })
        .populate('requestTo', {
          id: 1,
          firstName: 1,
          lastName: 1,
        })
        .sort({ updatedAt: -1 })
        .limit(10)) || [];
    next({
      ownLeaves: ownLeaves || [],
      approvedLeaves: approvedLeaves || [],
      allLeaves: allLeaves || [],
      requestToMe: requestToMe || [],
    });
  } catch (error) {
    next(new UnexpectedError('Leave'));
  }
};

export const getLeave = async (req, res, next) => {
  const leave = await Leave.findOne({ _id: req.params.id });

  if (!leave) {
    next(new LeaveNotFound());
  } else {
    next(leave);
  }
};

export const getPendingLeaves = async (req, res, next) => {
  Leave.find({ status: 'pending' }).exec((err, data) => {
    if (err) {
      throw err;
    }
    if (data.length === 0) {
      next(new NoPendingLeave());
    } else if (data) {
      next(data);
    }
  });
};

export const approveLeave = async (req, res, next) => {
  const userRole = req.user.employee.role;
  const { isApprovalRequest, comment } = req.body;

  if (
    userRole === 'ADMIN' ||
    userRole === 'TL' ||
    userRole === 'HR' ||
    userRole === 'PM'
  ) {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      next(new Error('Leave not found !'));
    } else {
      if (leave.requestTo.includes(req.user.employee.id)) {
        const pendingRequest = await Leave.findOne({
          _id: req.params.id,
          status: 'pending',
        });
        if (!pendingRequest) {
          next(new Error('No pending Request'));
        }
        // console.log(pendingRequest);
        let approvalBy = [...pendingRequest.approvedBy];
        const isVotedApproved = approvalBy.find(
          (pr) => pr.author.toString() === req.user.employee.id.toString()
        );

        let rejectionBy = [...pendingRequest.rejectedBy];
        const isVotedRejected = rejectionBy.find(
          (pr) => pr.author.toString() === req.user.employee.id.toString()
        );

        if (isVotedApproved) {
          next(
            new AppError(400, 'Already Approved By User', 'already approved')
          );
        } else if (isVotedRejected) {
          next(
            new AppError(400, 'Already Rejected By User', 'already rejected')
          );
        } else {
          if (isApprovalRequest === true) {
            if (userRole === 'HR' || userRole === 'ADMIN') {
              let approvalByHR = await Leave.findOneAndUpdate(
                {
                  _id: leave.id,
                },
                {
                  $set: {
                    status: 'approved',
                  },
                  $push: {
                    approvedBy: {
                      author: req.user.employee.id,
                      comment: comment || 'leave Approved',
                    },
                  },
                  $pull: {
                    requestTo: req.user.employee.id,
                  },
                },
                {
                  new: true,
                }
              )
                .populate({
                  path: 'approvedBy',
                  populate: {
                    path: 'author ',
                    comment: 1,
                  },
                })
                .populate({
                  path: 'rejectedBy',
                  populate: {
                    path: 'author ',
                    comment: 1,
                  },
                });
              next(approvalByHR);
            }
            if (userRole === 'TL' || userRole === 'PM') {
              let approvalByTL = await Leave.findOneAndUpdate(
                {
                  _id: leave.id,
                },
                {
                  $push: {
                    approvedBy: {
                      author: req.user.employee.id,
                      comment: comment || 'leave approved by TL',
                    },
                  },
                  $pull: {
                    requestTo: req.user.employee.id,
                  },
                },
                {
                  new: true,
                }
              )
                .populate({
                  path: 'approvedBy',
                  populate: {
                    path: 'author ',
                    comment: 1,
                  },
                })
                .populate({
                  path: 'rejectedBy',
                  populate: {
                    path: 'author ',
                    comment: 1,
                  },
                });
              next(approvalByTL);
            }
          } else {
            if (userRole === 'HR' || userRole === 'ADMIN') {
              let rejectionByHR = await Leave.findOneAndUpdate(
                {
                  _id: leave.id,
                },
                {
                  $set: {
                    status: 'rejected',
                  },
                  $push: {
                    rejectedBy: {
                      author: req.user.employee.id,
                      comment: comment || 'leave rejected',
                    },
                  },
                  $pull: {
                    requestTo: req.user.employee.id,
                  },
                },
                {
                  new: true,
                }
              )
                .populate({
                  path: 'approvedBy',
                  populate: {
                    path: 'author ',
                    comment: 1,
                  },
                })
                .populate({
                  path: 'rejectedBy',
                  populate: {
                    path: 'author ',
                    comment: 1,
                  },
                });
              next(rejectionByHR);
            }
            if (userRole === 'TL' || userRole === 'PM') {
              let rejectedByTL = await Leave.findOneAndUpdate(
                {
                  _id: leave.id,
                },
                {
                  $set: {
                    status: 'rejected',
                  },
                  $push: {
                    rejectedBy: {
                      author: req.user.employee.id,
                      comment: comment || 'leave rejected by TL',
                    },
                  },
                  $pull: {
                    requestTo: req.user.employee.id,
                  },
                },
                {
                  new: true,
                }
              )
                .populate('requestTo', {
                  id: 1,
                  firstName: 1,
                  lastName: 1,
                  email: 1,
                })
                .populate({
                  path: 'approvedBy',
                  populate: {
                    path: 'author ',
                    comment: 1,
                  },
                })
                .populate({
                  path: 'rejectedBy',
                  populate: {
                    path: 'author ',
                    comment: 1,
                  },
                });
              next(rejectedByTL);
            }
          }
        }
      } else {
        next(new Error('Not Allowed'));
      }
    }
  }
};

export const getEmployeeData = async (req, res, next) => {
  const { id, role } = req.user.employee;
  let employees;
  if (role === 'HR' || role === 'ADMIN') {
    employees = await Employee.find({
      $or: [{ role: ['ADMIN', 'HR', 'TL', 'PM'] }],
    }).select({ firstName: 1, lastName: 1 });
  } else {
    employees = await Employee.find({
      $or: [{ role: ['ADMIN', 'HR', 'TL', 'PM'] }],
      _id: {
        $ne: id,
      },
      role: {
        $ne: role,
      },
    }).select({ firstName: 1, lastName: 1 });
  }

  if (!employees) {
    next(new AppError(404, 'Employee Data not found', 'Data not found'));
  }

  next(employees);
};

export const updateLeave = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user.employee;
  const {
    requestTo,
    type,
    startDate,
    endDate,
    returnDate,
    requestCreatedAt,
    reason,
    isAdhocLeave,
    adhocStatus,
    availableOnPhone,
    availableOnCity,
    emergencyContact,
    status,
    approvedBy,
    rejectedBy,
    halfDayStatus,
  } = req.body;

  let data = {
    requestTo,
    type,
    startDate,
    endDate,
    returnDate,
    requestCreatedAt,
    reason,
    isAdhocLeave,
    adhocStatus,
    availableOnPhone,
    availableOnCity,
    emergencyContact,
    status,
    approvedBy,
    rejectedBy,
    halfDayStatus,
  };

  const parameter = cleanObject(data);
  const requestToEmployee =
    (await Employee.find({ _id: { $in: requestTo } })) || [];

  Leave.findByIdAndUpdate(id, parameter, { new: true }, (err, leaveData) => {
    if (err) {
      throw err;
    } else {
      next({
        message: 'Successfully Applied for leave',
        id: leaveData.id,
        requestFrom: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        requestTo: requestToEmployee.map((e) => ({
          id: e.id,
          firstName: e.firstName,
          lastName: e.lastName,
          email: e.email,
          contactNumber: e.contactNumber,
        })),
        halfDayStatus: leaveData.halfDayStatus,
        type: leaveData.type,
        status: leaveData.status,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        returnDate: leaveData.returnDate,
        reason: leaveData.reason,
        isAdhocLeave: leaveData.isAdhocLeave,
        adhocStatus: leaveData.adhocStatus,
        availableOnPhone: leaveData.availableOnPhone,
        availableOnCity: leaveData.availableOnCity,
        emergencyContact: leaveData.emergencyContact,
        createdAt: leaveData.createdAt,
        updatedAt: leaveData.updatedAt,
      });
    }
  });
};

export const deleteLeave = (req, res, next) => {
  const { id } = req.params;

  Leave.findByIdAndDelete(id, (err, deletedRow) => {
    if (err) {
      next(new AppError(400, 'Leave unable to delete', 'Unable to Delete'));
    } else {
      next(deletedRow);
    }
  });
};

export const getInitialTeamLeaves = async (req, res, next) => {
  const {
    user: {
      employee: { role, team },
    },
  } = req;

  let todayStart = new Date();
  todayStart.setHours(8, 0, 0);
  let todayEnd = new Date();
  todayEnd.setHours(21, 59, 59);

  const allTeams =
    (await MasterEntities.findOne({ type: 'Teams' })).values || [];

  const populatedTeam =
    (await MasterEntities.findOne({ type: 'Teams' }).populate('values')) || [];

  let onLeaveTeamData = {};
  populatedTeam.values.forEach((e) => (onLeaveTeamData[e.value] = []));

  let upComingLeaveTeamData = {};
  populatedTeam.values.forEach((e) => (upComingLeaveTeamData[e.value] = []));

  const onLeaveData = await Leave.find({
    startDate: {
      $lte: todayStart,
    },
    endDate: {
      $gte: todayEnd,
    },
    status: 'approved',
  })
    .populate({
      path: 'requestFrom',
      populate: {
        path: 'team',
        select: {
          value: 1,
        },
      },
      select: {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      },
    })
    .populate({
      path: 'requestTo',
      populate: {
        path: 'team',
        select: {
          value: 1,
        },
      },
      select: {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      },
    })
    .populate({
      path: 'approvedBy',
      populate: {
        path: 'author ',
        select: {
          firstName: 1,
          lastName: 1,
          email: 1,
        },
        populate: {
          path: 'team',
          select: {
            value: 1,
          },
        },
      },
    })
    .populate({
      path: 'rejectedBy',
      populate: {
        path: 'author ',
        select: {
          firstName: 1,
          lastName: 1,
          email: 1,
        },
        populate: {
          path: 'team',
          select: {
            value: 1,
          },
        },
      },
    });
  const upComingData = await Leave.find({
    startDate: {
      $gt: todayEnd,
    },
    status: 'approved',
  })
    .populate({
      path: 'requestFrom',
      populate: {
        path: 'team',
        select: {
          value: 1,
        },
      },
      select: {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      },
    })
    .populate({
      path: 'requestTo',
      populate: {
        path: 'team',
        select: {
          value: 1,
        },
      },
      select: {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      },
    })
    .populate({
      path: 'approvedBy',
      populate: {
        path: 'author ',
        select: {
          firstName: 1,
          lastName: 1,
          email: 1,
        },
        populate: {
          path: 'team',
          select: {
            value: 1,
          },
        },
      },
    })
    .populate({
      path: 'rejectedBy',
      populate: {
        path: 'author ',
        select: {
          firstName: 1,
          lastName: 1,
          email: 1,
        },
        populate: {
          path: 'team',
          select: {
            value: 1,
          },
        },
      },
    });
  if (role === 'ADMIN' || role === 'HR') {
    let onLeave = onLeaveData;
    if (onLeave.length === 0) {
      onLeave = { ...onLeave };
    } else {
      onLeave.forEach((e) => {
        e.requestFrom.team.forEach((el) => {
          onLeaveTeamData[el.value].push(e);
        });
      });
    }

    let upComingLeave = upComingData;
    if (upComingLeave.length === 0) {
      upComingLeave = { ...upComingLeave };
    } else {
      upComingLeave.forEach((e) => {
        e.requestFrom.team.forEach((el) => {
          upComingLeaveTeamData[el.value].push(e);
        });
      });
    }

    next({
      todayOnLeave: onLeaveTeamData || {},
      upComingLeave: upComingLeaveTeamData || {},
    });
  } else {
    let onLeave = onLeaveData.filter((leave) => {
      const intTeam =
        leave.requestFrom.role === 'HR' || leave.requestFrom.role === 'ADMIN'
          ? allTeams
          : leave.requestFrom.team.map((t) => t.id);
      console.log(intTeam, '<-inteam', team);
      return intersectionArray(team, intTeam).length > 0;
    });

    let upComingLeave = upComingData.filter((leave) => {
      const intTeam =
        leave.requestFrom.role === 'HR' || leave.requestFrom.role === 'ADMIN'
          ? allTeams
          : leave.requestFrom.team.map((t) => t.id);
      console.log(intTeam, '<-inteam ', team);
      return intersectionArray(team, intTeam).length > 0;
    });

    if (onLeave.length === 0) {
      onLeave = { ...onLeave };
    } else {
      onLeave.forEach((e) => {
        e.requestFrom.team.forEach((el) => {
          team.forEach((ele) => {
            if (ele === el.id) {
              onLeaveTeamData[el.value].push(e);
            }
          });
        });
      });
    }

    if (upComingLeave.length === 0) {
      upComingLeave = { ...upComingLeave };
    } else {
      upComingLeave.forEach((e) => {
        e.requestFrom.team.forEach((el) => {
          team.forEach((ele) => {
            if (ele === el.id) {
              upComingLeaveTeamData[el.value].push(e);
            }
          });
        });
      });
    }

    next({
      todayOnLeave: onLeaveTeamData || {},
      upComingLeave: upComingLeaveTeamData || {},
    });
  }
};
